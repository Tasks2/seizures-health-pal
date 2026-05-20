import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import {
  Appointment,
  EmergencyContact,
  Medication,
  MedicationReminder,
  SeizureLog,
  SymptomJournalEntry,
} from '@/types/health';

type ProfileData = {
  seizures: SeizureLog[];
  medications: Medication[];
  appointments: Appointment[];
  reminders: MedicationReminder[];
  emergencyContacts: EmergencyContact[];
  symptomJournal: SymptomJournalEntry[];
};

const emptyProfileData: ProfileData = {
  seizures: [],
  medications: [],
  appointments: [],
  reminders: [],
  emergencyContacts: [],
  symptomJournal: [],
};

const showError = (title: string, error: unknown) => {
  const description = error instanceof Error ? error.message : 'Please try again.';
  toast({ title, description, variant: 'destructive' });
};

const toSeizure = (row: Tables<'seizure_logs'>): SeizureLog => ({
  id: row.id,
  date: row.date,
  time: row.time,
  type: row.type as SeizureLog['type'],
  duration: row.duration,
  triggers: row.triggers ?? undefined,
  notes: row.notes ?? undefined,
  severity: row.severity as SeizureLog['severity'],
});

const toMedication = (row: Tables<'medications'>): Medication => ({
  id: row.id,
  name: row.name,
  dosage: row.dosage,
  frequency: row.frequency,
  times: row.times,
  refillDate: row.refill_date ?? undefined,
  pillsRemaining: row.pills_remaining ?? undefined,
  notes: row.notes ?? undefined,
  reminderEnabled: row.reminder_enabled ?? undefined,
});

const toAppointment = (row: Tables<'appointments'>): Appointment => ({
  id: row.id,
  title: row.title,
  doctor: row.doctor,
  location: row.location ?? undefined,
  date: row.date,
  time: row.time,
  notes: row.notes ?? undefined,
});

const toReminder = (row: Tables<'medication_reminders'>): MedicationReminder => ({
  id: row.id,
  medicationId: row.medication_id,
  time: row.time,
  taken: row.taken,
  date: row.date,
});

const toEmergencyContact = (row: Tables<'emergency_contacts'>): EmergencyContact => ({
  id: row.id,
  name: row.name,
  relationship: row.relationship,
  phone: row.phone,
  email: row.email ?? undefined,
  isPrimary: row.is_primary,
  notifyOnSevereSeizure: row.notify_on_severe_seizure,
});

const toSymptomEntry = (row: Tables<'symptom_journal_entries'>): SymptomJournalEntry => ({
  id: row.id,
  date: row.date,
  mood: row.mood as SymptomJournalEntry['mood'],
  sleepQuality: row.sleep_quality as SymptomJournalEntry['sleepQuality'],
  sleepHours: row.sleep_hours,
  stressLevel: row.stress_level as SymptomJournalEntry['stressLevel'],
  energyLevel: row.energy_level as SymptomJournalEntry['energyLevel'],
  exercised: row.exercised,
  alcoholConsumed: row.alcohol_consumed,
  missedMedication: row.missed_medication,
  notes: row.notes ?? undefined,
});

const medicationToRow = (medication: Partial<Medication>) => ({
  name: medication.name,
  dosage: medication.dosage,
  frequency: medication.frequency,
  times: medication.times,
  refill_date: medication.refillDate ?? null,
  pills_remaining: medication.pillsRemaining ?? null,
  notes: medication.notes ?? null,
  reminder_enabled: medication.reminderEnabled ?? false,
});

const contactToRow = (contact: Partial<EmergencyContact>) => ({
  name: contact.name,
  relationship: contact.relationship,
  phone: contact.phone,
  email: contact.email ?? null,
  is_primary: contact.isPrimary,
  notify_on_severe_seizure: contact.notifyOnSevereSeizure,
});

const symptomToRow = (entry: Partial<SymptomJournalEntry>) => ({
  date: entry.date,
  mood: entry.mood,
  sleep_quality: entry.sleepQuality,
  sleep_hours: entry.sleepHours,
  stress_level: entry.stressLevel,
  energy_level: entry.energyLevel,
  exercised: entry.exercised,
  alcohol_consumed: entry.alcoholConsumed,
  missed_medication: entry.missedMedication,
  notes: entry.notes ?? null,
});

export function useHealthData() {
  const [data, setData] = useState<ProfileData>(emptyProfileData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const ensureUser = useCallback(async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user?.id) {
      throw new Error('Please sign in before loading health data.');
    }

    return userData.user.id;
  }, []);

  const loadData = useCallback(async () => {
    setIsLoaded(false);
    try {
      const uid = await ensureUser();
      setUserId(uid);

      const [
        seizuresResult,
        medicationsResult,
        appointmentsResult,
        remindersResult,
        contactsResult,
        journalResult,
      ] = await Promise.all([
        supabase.from('seizure_logs').select('*').order('date', { ascending: false }).order('time', { ascending: false }),
        supabase.from('medications').select('*').order('name', { ascending: true }),
        supabase.from('appointments').select('*').order('date', { ascending: true }).order('time', { ascending: true }),
        supabase.from('medication_reminders').select('*').order('date', { ascending: false }),
        supabase.from('emergency_contacts').select('*').order('is_primary', { ascending: false }).order('name', { ascending: true }),
        supabase.from('symptom_journal_entries').select('*').order('date', { ascending: false }),
      ]);

      const errors = [
        seizuresResult.error,
        medicationsResult.error,
        appointmentsResult.error,
        remindersResult.error,
        contactsResult.error,
        journalResult.error,
      ].filter(Boolean);

      if (errors[0]) throw errors[0];

      setData({
        seizures: (seizuresResult.data ?? []).map(toSeizure),
        medications: (medicationsResult.data ?? []).map(toMedication),
        appointments: (appointmentsResult.data ?? []).map(toAppointment),
        reminders: (remindersResult.data ?? []).map(toReminder),
        emergencyContacts: (contactsResult.data ?? []).map(toEmergencyContact),
        symptomJournal: (journalResult.data ?? []).map(toSymptomEntry),
      });
    } catch (error) {
      showError('Could not load health data', error);
      setData(emptyProfileData);
    } finally {
      setIsLoaded(true);
    }
  }, [ensureUser]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const addSeizure = async (seizure: Omit<SeizureLog, 'id'>) => {
    if (!userId) return;
    try {
      const payload: TablesInsert<'seizure_logs'> = { ...seizure, user_id: userId };
      const { data: row, error } = await supabase.from('seizure_logs').insert(payload).select().single();
      if (error) throw error;
      const newSeizure = toSeizure(row);
      setData(prev => ({ ...prev, seizures: [newSeizure, ...prev.seizures] }));
      toast({ title: 'Seizure logged' });
      return newSeizure;
    } catch (error) {
      showError('Could not save seizure', error);
    }
  };

  const updateSeizure = async (id: string, updates: Partial<SeizureLog>) => {
    try {
      const payload: TablesUpdate<'seizure_logs'> = updates;
      const { data: row, error } = await supabase.from('seizure_logs').update(payload).eq('id', id).select().single();
      if (error) throw error;
      const updated = toSeizure(row);
      setData(prev => ({ ...prev, seizures: prev.seizures.map(s => (s.id === id ? updated : s)) }));
      toast({ title: 'Seizure updated' });
    } catch (error) {
      showError('Could not update seizure', error);
    }
  };

  const deleteSeizure = async (id: string) => {
    try {
      const { error } = await supabase.from('seizure_logs').delete().eq('id', id);
      if (error) throw error;
      setData(prev => ({ ...prev, seizures: prev.seizures.filter(s => s.id !== id) }));
      toast({ title: 'Seizure deleted' });
    } catch (error) {
      showError('Could not delete seizure', error);
    }
  };

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    if (!userId) return;
    try {
      const payload: TablesInsert<'medications'> = {
        ...medicationToRow(medication),
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        times: medication.times,
        user_id: userId,
      };
      const { data: row, error } = await supabase.from('medications').insert(payload).select().single();
      if (error) throw error;
      const newMedication = toMedication(row);
      setData(prev => ({ ...prev, medications: [...prev.medications, newMedication] }));
      toast({ title: 'Medication saved' });
      return newMedication;
    } catch (error) {
      showError('Could not save medication', error);
    }
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    try {
      const { data: row, error } = await supabase
        .from('medications')
        .update(medicationToRow(updates))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = toMedication(row);
      setData(prev => ({ ...prev, medications: prev.medications.map(m => (m.id === id ? updated : m)) }));
      toast({ title: 'Medication updated' });
    } catch (error) {
      showError('Could not update medication', error);
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      const { error } = await supabase.from('medications').delete().eq('id', id);
      if (error) throw error;
      setData(prev => ({
        ...prev,
        medications: prev.medications.filter(m => m.id !== id),
        reminders: prev.reminders.filter(r => r.medicationId !== id),
      }));
      toast({ title: 'Medication deleted' });
    } catch (error) {
      showError('Could not delete medication', error);
    }
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    if (!userId) return;
    try {
      const payload: TablesInsert<'appointments'> = { ...appointment, user_id: userId };
      const { data: row, error } = await supabase.from('appointments').insert(payload).select().single();
      if (error) throw error;
      const newAppointment = toAppointment(row);
      setData(prev => ({ ...prev, appointments: [...prev.appointments, newAppointment] }));
      toast({ title: 'Appointment saved' });
      return newAppointment;
    } catch (error) {
      showError('Could not save appointment', error);
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data: row, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single();
      if (error) throw error;
      const updated = toAppointment(row);
      setData(prev => ({ ...prev, appointments: prev.appointments.map(a => (a.id === id ? updated : a)) }));
      toast({ title: 'Appointment updated' });
    } catch (error) {
      showError('Could not update appointment', error);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      setData(prev => ({ ...prev, appointments: prev.appointments.filter(a => a.id !== id) }));
      toast({ title: 'Appointment deleted' });
    } catch (error) {
      showError('Could not delete appointment', error);
    }
  };

  const markMedicationTaken = async (medicationId: string, date: string, time: string, taken: boolean) => {
    if (!userId) return;
    try {
      const existingReminder = data.reminders.find(
        r => r.medicationId === medicationId && r.date === date && r.time === time
      );

      if (existingReminder) {
        const { data: row, error } = await supabase
          .from('medication_reminders')
          .update({ taken })
          .eq('id', existingReminder.id)
          .select()
          .single();
        if (error) throw error;
        const updated = toReminder(row);
        setData(prev => ({ ...prev, reminders: prev.reminders.map(r => (r.id === updated.id ? updated : r)) }));
      } else {
        const payload: TablesInsert<'medication_reminders'> = {
          medication_id: medicationId,
          date,
          time,
          taken,
          user_id: userId,
        };
        const { data: row, error } = await supabase.from('medication_reminders').insert(payload).select().single();
        if (error) throw error;
        const newReminder = toReminder(row);
        setData(prev => ({ ...prev, reminders: [...prev.reminders, newReminder] }));
      }
    } catch (error) {
      showError('Could not update medication reminder', error);
    }
  };

  const addEmergencyContact = async (contact: Omit<EmergencyContact, 'id'>) => {
    if (!userId) return;
    try {
      const payload: TablesInsert<'emergency_contacts'> = {
        ...contactToRow(contact),
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        is_primary: contact.isPrimary,
        notify_on_severe_seizure: contact.notifyOnSevereSeizure,
        user_id: userId,
      };
      const { data: row, error } = await supabase.from('emergency_contacts').insert(payload).select().single();
      if (error) throw error;
      const newContact = toEmergencyContact(row);
      setData(prev => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, newContact] }));
      toast({ title: 'Emergency contact saved' });
      return newContact;
    } catch (error) {
      showError('Could not save emergency contact', error);
    }
  };

  const updateEmergencyContact = async (id: string, updates: Partial<EmergencyContact>) => {
    try {
      const { data: row, error } = await supabase
        .from('emergency_contacts')
        .update(contactToRow(updates))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = toEmergencyContact(row);
      setData(prev => ({
        ...prev,
        emergencyContacts: prev.emergencyContacts.map(c => (c.id === id ? updated : c)),
      }));
      toast({ title: 'Emergency contact updated' });
    } catch (error) {
      showError('Could not update emergency contact', error);
    }
  };

  const deleteEmergencyContact = async (id: string) => {
    try {
      const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
      if (error) throw error;
      setData(prev => ({ ...prev, emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id) }));
      toast({ title: 'Emergency contact deleted' });
    } catch (error) {
      showError('Could not delete emergency contact', error);
    }
  };

  const addSymptomEntry = async (entry: Omit<SymptomJournalEntry, 'id'>) => {
    if (!userId) return;
    try {
      const payload: TablesInsert<'symptom_journal_entries'> = {
        ...symptomToRow(entry),
        date: entry.date,
        mood: entry.mood,
        sleep_quality: entry.sleepQuality,
        sleep_hours: entry.sleepHours,
        stress_level: entry.stressLevel,
        energy_level: entry.energyLevel,
        user_id: userId,
      };
      const { data: row, error } = await supabase.from('symptom_journal_entries').insert(payload).select().single();
      if (error) throw error;
      const newEntry = toSymptomEntry(row);
      setData(prev => ({ ...prev, symptomJournal: [newEntry, ...prev.symptomJournal] }));
      toast({ title: 'Journal entry saved' });
      return newEntry;
    } catch (error) {
      showError('Could not save journal entry', error);
    }
  };

  const updateSymptomEntry = async (id: string, updates: Partial<SymptomJournalEntry>) => {
    try {
      const { data: row, error } = await supabase
        .from('symptom_journal_entries')
        .update(symptomToRow(updates))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = toSymptomEntry(row);
      setData(prev => ({ ...prev, symptomJournal: prev.symptomJournal.map(e => (e.id === id ? updated : e)) }));
      toast({ title: 'Journal entry updated' });
    } catch (error) {
      showError('Could not update journal entry', error);
    }
  };

  const deleteSymptomEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('symptom_journal_entries').delete().eq('id', id);
      if (error) throw error;
      setData(prev => ({ ...prev, symptomJournal: prev.symptomJournal.filter(e => e.id !== id) }));
      toast({ title: 'Journal entry deleted' });
    } catch (error) {
      showError('Could not delete journal entry', error);
    }
  };

  return {
    ...data,
    isLoaded,
    addSeizure,
    updateSeizure,
    deleteSeizure,
    addMedication,
    updateMedication,
    deleteMedication,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    markMedicationTaken,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    addSymptomEntry,
    updateSymptomEntry,
    deleteSymptomEntry,
  };
}
