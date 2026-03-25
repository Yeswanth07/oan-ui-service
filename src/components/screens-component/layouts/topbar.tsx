import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function Topbar() {
	return (
		<div className="flex w-full items-center justify-between gap-3">
			<div className="flex items-center gap-2">
				<Button variant="outline" size="icon" className="h-9 w-9">
					<Bell className="h-4 w-4" />
				</Button>

				<Separator orientation="vertical" className="mx-1 h-5" />

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-9 gap-2 px-2">
							<span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
								<User className="h-4 w-4" />
							</span>
							<span className="hidden sm:inline">Profile</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>Account</DropdownMenuItem>
						<DropdownMenuItem>Settings</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-destructive focus:text-destructive">
							Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
