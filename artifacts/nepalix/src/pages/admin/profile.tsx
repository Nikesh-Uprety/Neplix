import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function AdminProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.account.updateProfile({ firstName, lastName });
      toast({ title: "Profile updated" });
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    setSavingPassword(true);
    try {
      await api.account.changePassword({ currentPassword, newPassword });
      toast({ title: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AdminLayout title="Profile" subtitle="Your account and store details">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Profile</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#6B7280]">First name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-[#6B7280]">Last name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#6B7280]">Email</label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-[#6B7280]">
              <div>
                <div className="uppercase tracking-wide">Role</div>
                <div className="text-[#111827] capitalize font-medium">{user?.role}</div>
              </div>
              <div>
                <div className="uppercase tracking-wide">Store</div>
                <div className="text-[#111827] font-medium">{user?.storeId ?? "—"}</div>
              </div>
            </div>
            <Button onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Change password</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#6B7280]">Current password</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-[#6B7280]">New password</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button
              onClick={changePassword}
              disabled={savingPassword || !currentPassword || newPassword.length < 8}
            >
              {savingPassword ? "Updating…" : "Update password"}
            </Button>
            <p className="text-xs text-[#9CA3AF]">Min 8 characters.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
