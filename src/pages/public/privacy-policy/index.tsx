import { useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Shield,
	Database,
	FileText,
	Lock,
	Link as LinkIcon,
	Users,
	AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

function PrivacyPolicy() {
	const navigate = useNavigate();

	return (
		<div className="flex h-full flex-col bg-background transition-colors duration-300">
			{/* Privacy Policy Header */}
			<div className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: "/chat" })}
					className="h-10 w-10 text-gray-900 dark:text-gray-100"
				>
					<ArrowLeft className="h-6 w-6" />
				</Button>
				<h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Privacy Policy</h1>
			</div>

			{/* Privacy Policy Content */}
			<div className="flex-1 overflow-y-auto p-5">
				<div className="mx-auto max-w-4xl space-y-6">
					{/* Introduction */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<Shield className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<div>
								<h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
									Privacy Policy
								</h2>
								<p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
									The Ministry of Agriculture and Farmer Welfare, Govt. of India (MOA&FW) built the
									Bharat-VISTAAR app as a Free app. This SERVICE is provided by MOA&FW at no cost
									and is intended for use as is.
								</p>
								<p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
									This page is used to inform visitors regarding our policies with the collection,
									use, and disclosure of Personal Information if anyone decided to use our Service.
								</p>
								<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
									If you choose to use our Service, then you agree to the collection and use of
									information in relation to this policy. The Personal Information that we collect
									is used for providing and improving the Service. We will not use or share your
									information with anyone except as described in this Privacy Policy.
								</p>
							</div>
						</div>
					</div>

					{/* Information Collection and Use */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<Database className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
								Information Collection and Use
							</h2>
						</div>
						<div className="ml-9 space-y-3">
							<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								For a better experience, while using our Service, we may require you to provide us
								with certain personally identifiable information, including but not limited to:
							</p>
							<ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>Farmer's Name</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>Mobile Number</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>Address</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>Gender</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>Caste</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>Email ID</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>Farmer's farming details like plot area, plot's geo-location</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>IP address</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>Unique device identifiers</span>
								</li>
							</ul>
							<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								The information that we request will be retained by us and used as described in this
								privacy policy.
							</p>
							<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								The app does use third-party services that may collect information used to identify
								you.
							</p>
						</div>
					</div>

					{/* Log Data */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<FileText className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Log Data</h2>
						</div>
						<p className="mb-3 ml-9 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
							We want to inform you that whenever you use our Service, in a case of an error in the
							app we collect data and information (through third-party products) on your phone
							called Log Data.
						</p>
						<p className="ml-9 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
							This Log Data may include information such as your device Internet Protocol ("IP")
							address, device name, operating system version, the configuration of the app when
							utilizing our Service, the time and date of your use of the Service, and other
							statistics.
						</p>
					</div>

					{/* Cookies */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<Database className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cookies</h2>
						</div>
						<div className="ml-9 space-y-3">
							<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								Cookies are files with a small amount of data that are commonly used as anonymous
								unique identifiers. These are sent to your browser from the websites that you visit
								and are stored on your device's internal memory.
							</p>
							<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								This Service does not use these "cookies" explicitly. However, the app may use
								third-party code and libraries that use "cookies" to collect information and improve
								their services. You have the option to either accept or refuse these cookies and
								know when a cookie is being sent to your device. If you choose to refuse our
								cookies, you may not be able to use some portions of this Service.
							</p>
						</div>
					</div>

					{/* Service Providers */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<Users className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
								Service Providers
							</h2>
						</div>
						<div className="ml-9 space-y-3">
							<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								We may employ third-party companies and individuals due to the following reasons:
							</p>
							<ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>To facilitate our Service</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>To provide the Service on our behalf</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>To perform Service-related services</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="mt-1 text-[#00a651]">•</span>
									<span>To assist us in analyzing how our Service is used</span>
								</li>
							</ul>
							<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								We want to inform users of this Service that these third parties have access to
								their Personal Information. The reason is to perform the tasks assigned to them on
								our behalf. However, they are obligated not to disclose or use the information for
								any other purpose.
							</p>
						</div>
					</div>

					{/* Security */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<Lock className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Security</h2>
						</div>
						<p className="ml-9 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
							We value your trust in providing us your Personal Information, thus we are striving to
							use commercially acceptable means of protecting it. But remember that no method of
							transmission over the internet, or method of electronic storage is 100% secure and
							reliable, and we cannot guarantee its absolute security.
						</p>
					</div>

					{/* Links to Other Sites */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<LinkIcon className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
								Links to Other Sites
							</h2>
						</div>
						<p className="ml-9 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
							This Service may contain links to other sites. If you click on a third-party link, you
							will be directed to that site. Note that these external sites are not operated by us.
							Therefore, we strongly advise you to review the Privacy Policy of these websites. We
							have no control over and assume no responsibility for the content, privacy policies,
							or practices of any third-party sites or services.
						</p>
					</div>

					{/* Children's Privacy */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
								Children's Privacy
							</h2>
						</div>
						<p className="ml-9 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
							These Services do not address anyone under the age of 13. We do not knowingly collect
							personally identifiable information from children under 13 years of age. In the case
							we discover that a child under 13 has provided us with personal information, we
							immediately delete this from our servers. If you are a parent or guardian and you are
							aware that your child has provided us with personal information, please contact us so
							that we will be able to do the necessary actions.
						</p>
					</div>

					{/* Changes to This Privacy Policy */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<FileText className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
								Changes to This Privacy Policy
							</h2>
						</div>
						<div className="ml-9 space-y-3">
							<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								We may update our Privacy Policy from time to time. Thus, you are advised to review
								this page periodically for any changes. We will notify you of any changes by posting
								the new Privacy Policy on this page.
							</p>
							<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
								This policy is effective as of{" "}
								{new Date().toLocaleDateString("en-US", {
									year: "numeric",
									month: "2-digit",
									day: "2-digit"
								})}
							</p>
						</div>
					</div>

					{/* Contact Us */}
					<div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-4 flex items-start gap-3">
							<FileText className="mt-1 h-6 w-6 flex-shrink-0 text-[#00a651]" />
							<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Us</h2>
						</div>
						<div className="ml-9 space-y-3">
							<p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
								If you have any questions or suggestions about our Privacy Policy, do not hesitate
								to contact us.
							</p>
							<div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
								<p className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">Email</p>
								<a href="mailto:us-it@gov.in" className="text-sm text-[#00a651] hover:underline">
									us-it@gov.in
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PrivacyPolicy;
