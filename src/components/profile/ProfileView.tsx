import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Profile } from '@/types/health';

interface ProfileViewProps {
  profile?: Profile;
  onUpdate: (updates: Partial<Profile>) => Promise<Profile | undefined>;
}

export function ProfileView({ profile, onUpdate }: ProfileViewProps) {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [preferredContact, setPreferredContact] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.fullName ?? '');
    setDateOfBirth(profile?.dateOfBirth ?? '');
    setDoctorName(profile?.doctorName ?? '');
    setPreferredContact(profile?.preferredContact ?? '');
    setEmergencyNotes(profile?.emergencyNotes ?? '');
  }, [profile]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await onUpdate({
        fullName: fullName.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        doctorName: doctorName.trim() || undefined,
        preferredContact: preferredContact.trim() || undefined,
        emergencyNotes: emergencyNotes.trim() || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Profile</h2>
        <p className="text-muted-foreground">Manage the personal details used across your health tracker</p>
      </div>

      <Card className="card-elevated max-w-3xl">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <UserRound className="w-5 h-5 text-primary" />
            Your Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  placeholder="e.g., Amy Tanya"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="doctorName">Primary doctor</Label>
                <Input
                  id="doctorName"
                  placeholder="e.g., Dr. Smith"
                  value={doctorName}
                  onChange={(event) => setDoctorName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredContact">Preferred contact</Label>
                <Input
                  id="preferredContact"
                  placeholder="Phone, email, or care contact"
                  value={preferredContact}
                  onChange={(event) => setPreferredContact(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyNotes">Emergency notes</Label>
              <Textarea
                id="emergencyNotes"
                placeholder="Important details for caregivers or clinicians..."
                value={emergencyNotes}
                onChange={(event) => setEmergencyNotes(event.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" className="btn-gradient gap-2" disabled={isSaving}>
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
