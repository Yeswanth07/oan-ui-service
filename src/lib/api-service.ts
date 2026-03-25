import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { environment } from '@/lib/config/environment';
import { getBrowserInfo } from '@/lib/utils';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface ChatResponse {
  response: string;
  status: string;
}

export interface TranscriptionResponse {
  text: string;
  lang_code: string;
  status: string;
}

export interface SuggestionItem {
  question: string;
}

interface TTSResponse {
  status: string;
  audio_data: string;
  session_id: string;
}

interface AuthResponse {
  token: string;
}

// Constants
const JWT_STORAGE_KEY = 'auth_jwt';

const getTokenExpiryFromExp = (token: string): number | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadPart = parts[1];
    if (!payloadPart) return null;

    const payloadBase64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(paddedPayload)) as { exp?: number };

    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

class ApiService {
  private apiUrl: string = environment.apiUrl;
  private locationData: LocationData | null = null;
  private currentSessionId: string | null = null;
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private refreshTokenPromise: Promise<string | null> | null = null;

  constructor() {
    this.authToken = this.getAuthToken();
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authToken ? `Bearer ${this.authToken}` : 'NA'
      }
    });

    // Add response interceptor for 401 errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && error.config) {
          const originalRequest = error.config as any;
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            const refreshedToken = await this.performTokenRefresh();
            if (refreshedToken) {
              originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${refreshedToken}`,
              };
              return this.axiosInstance.request(originalRequest);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    const keys = [JWT_STORAGE_KEY, 'accessToken', 'token'];
    
    for (const key of keys) {
      const data = localStorage.getItem(key);
      if (!data) continue;

      // Try to parse as JSON first (our new format)
      try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          // It's JSON. Check for token property.
          const token = parsed.token || parsed.access_token || parsed.accessToken;
          if (token) {
            const now = new Date().getTime();
            // Only expire if we have a valid future expiry date set
            if (parsed.expiry && parsed.expiry > 0 && now > parsed.expiry) {
              localStorage.removeItem(key);
              continue;
            }
            return token;
          }
        }
      } catch (e) {
        console.error(e);
        // Not JSON, assume it's a plain token string
        if (data.split('.').length === 3) {
          return data;
        }
      }
    }
    return null;
  }

  private refreshAuthToken(): void {
    this.authToken = this.getAuthToken();
    if (this.authToken) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
    } else {
      this.axiosInstance.defaults.headers.common['Authorization'] = 'NA';
      // Don't redirect here - let the 401 interceptor handle it when actual API calls fail
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const metadata = getBrowserInfo();
        const newToken = await this.fetchAuthToken(metadata);
        const expiry = getTokenExpiryFromExp(newToken);
        if (!expiry) {
          throw new Error('JWT exp claim missing; refusing to store token with synthetic expiry');
        }

        localStorage.setItem(
          JWT_STORAGE_KEY,
          JSON.stringify({
            token: newToken,
            expiry,
          })
        );

        this.authToken = newToken;
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return newToken;
      } catch (error) {
        console.error('Failed to refresh auth token:', error);
        this.authToken = null;
        this.axiosInstance.defaults.headers.common['Authorization'] = 'NA';
        return null;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  private async refreshAuthTokenIfExpiredOrMissing(): Promise<void> {
    this.refreshAuthToken();
    if (this.authToken) return;

    await this.performTokenRefresh();
  }
  
  // No longer redirecting to error page
  // private redirectToErrorPage(): void {
  //   // Check if we're in a browser environment and not already on error page
  //   if (typeof window !== 'undefined' && !window.location.pathname.includes('/error')) {
  //     window.location.href = '/error?reason=auth';
  //   }
  // }
  
  updateAuthToken(): void {
    this.refreshAuthToken();
  }

  private getAuthHeaders(): Record<string, string> {
    this.refreshAuthToken();
    return {
      'Authorization': this.authToken ? `Bearer ${this.authToken}` : 'NA'
    };
  }

  private validateAuth(): boolean {
    // If we have no token, alert but don't force redirect here
    // Let the calling component or an interceptor handle navigation
    if (!this.authToken) {
      console.error("Authentication token missing in ApiService");
      return false;
    }
    return true;
  }

  async sendUserQuery(
    msg: string,
    session: string,
    sourceLang: string,
    targetLang: string,
    onStreamData?: (_data: string) => void
  ): Promise<ChatResponse> {
    try {
      await this.refreshAuthTokenIfExpiredOrMissing();
      if (!this.validateAuth()) {
        return { response: "Authentication error", status: "error" };
      }
      
      const params = {
        session_id: session,
        query: msg,
        source_lang: sourceLang,
        target_lang: targetLang,
        ...(this.locationData && { location: `${this.locationData.latitude},${this.locationData.longitude}` })
      };

      const headers = this.getAuthHeaders();

      if (onStreamData) {
        // Handle streaming response
        let response = await fetch(`${this.apiUrl}/api/chat/?${new URLSearchParams(params)}`, {
          method: 'GET',
          headers: headers          
        });

        if (response.status === 401) {
          const refreshedToken = await this.performTokenRefresh();
          if (refreshedToken) {
            response = await fetch(`${this.apiUrl}/api/chat/?${new URLSearchParams(params)}`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${refreshedToken}`,
              },
            });
          }
        }

        if (!response.ok) {
          if (response.status === 401) {
            const error = new Error('Unauthorized');
            (error as any).status = 401;
            throw error;
          }
          if (response.status === 429) {
            const error = new Error('Rate limit exceeded');
            (error as any).status = 429;
            throw error;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        let fullResponse = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          onStreamData(chunk);
        }

        return { response: fullResponse, status: 'success' };
      } else {
        // Regular non-streaming request
        const config = {
          params,
          headers: this.getAuthHeaders()
        };
        const response = await this.axiosInstance.get('/api/chat/', config);
        return response.data;
      }
    } catch (error) {
      console.error('Error sending user query:', error);
      throw error;
    }
  }

  async getSuggestions(session: string, targetLang: string = 'mr'): Promise<SuggestionItem[]> {
    try {
      await this.refreshAuthTokenIfExpiredOrMissing();
      if (!this.validateAuth()) {
        return [];
      }
      
      const params = {
        session_id: session,
        target_lang: targetLang
      };

      const config = {
        params,
        headers: this.getAuthHeaders()
      };

      const response = await this.axiosInstance.get('/api/suggest/', config);
      return response.data.map((item: string) => ({
        question: item
      }));
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }

  async transcribeAudio(
    audioBase64: string,
    serviceType: string = 'bhashini',
    sessionId: string,
    lang_code: string
  ): Promise<TranscriptionResponse> {
    try {
      await this.refreshAuthTokenIfExpiredOrMissing();
      if (!this.validateAuth()) {
        return { text: "", lang_code: "", status: "error" };
      }
      
      const payload = {
        audio_content: audioBase64,
        service_type: serviceType,
        session_id: sessionId,
        lang_code: lang_code,
      };

      const config = {
        headers: this.getAuthHeaders()
      };

      const response = await this.axiosInstance.post('/api/transcribe/', payload, config);
      return response.data;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  async getTranscript(sessionId: string, text: string, targetLang: string): Promise<AxiosResponse<TTSResponse>> {
    await this.refreshAuthTokenIfExpiredOrMissing();
    if (!this.validateAuth()) {
      return Promise.reject(new Error("Authentication required"));
    }
    
    const config = {
      headers: this.getAuthHeaders(),
      timeout: 120000, // 120s timeout for TTS (can be slow on cold start)
    };
    
    return this.axiosInstance.post(`/api/tts/`, {
      session_id: sessionId,
      text: text,
      target_lang: targetLang
    }, config);
  }

  async submitPositiveFeedback(messageId: string): Promise<void> {
    try {
      await this.refreshAuthTokenIfExpiredOrMissing();
      if (!this.validateAuth()) return;
      
      const payload = {
        message_id: messageId,
        feedback: "positive"
      };

      await this.axiosInstance.post('/api/feedback/positive/', payload, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error submitting positive feedback:', error);
      throw error;
    }
  }

  async submitNegativeFeedback(messageId: string, reason: string, feedback: string): Promise<void> {
    try {
      await this.refreshAuthTokenIfExpiredOrMissing();
      if (!this.validateAuth()) return;
      
      const payload = {
        message_id: messageId,
        reason: reason,
        feedback: feedback
      };

      await this.axiosInstance.post('/api/feedback/negative/', payload, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error submitting negative feedback:', error);
      throw error;
    }
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const result = reader.result as string;
          const base64String = result.split(',')[1];
          if (base64String) {
            resolve(base64String);
          } else {
            reject(new Error('Failed to extract base64 from data URL'));
          }
        } catch (error) {
          console.error(error);
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }

  setLocationData(location: LocationData): void {
    this.locationData = location;
  }

  getLocationData(): LocationData | null {
    return this.locationData;
  }

  setSessionId(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  getSessionId(): string | null {
    return this.currentSessionId;
  }

  async fetchAuthToken(metadata: string): Promise<string> {
    try {
      // Don't use authentication headers for this call as we're getting the token
      const response = await axios.post<AuthResponse>(
        `${this.apiUrl}/api/token`,
        {
          metadata,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.token) {
        return response.data.token;
      }

      throw new Error("No token received from auth endpoint");
    } catch (error) {
      console.error("Error fetching auth token:", error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
