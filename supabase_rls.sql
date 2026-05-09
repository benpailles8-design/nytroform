-- ═══════════════════════════════════════════
-- RÉACTIVATION RLS SÉCURISÉE - NYTROFORM
-- ═══════════════════════════════════════════

-- 1. PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture profil" ON profiles;
DROP POLICY IF EXISTS "Modifier son profil" ON profiles;
DROP POLICY IF EXISTS "Insérer profil" ON profiles;
CREATE POLICY "Voir tous les profils" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Modifier son profil" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insérer profil" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. SESSIONS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voir ses séances" ON sessions;
DROP POLICY IF EXISTS "Créer séance (coach)" ON sessions;
DROP POLICY IF EXISTS "Modifier séance (coach)" ON sessions;
DROP POLICY IF EXISTS "Supprimer séance (coach)" ON sessions;
CREATE POLICY "Voir ses séances" ON sessions FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = coach_id
);
CREATE POLICY "Créer séance" ON sessions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach')
);
CREATE POLICY "Modifier séance" ON sessions FOR UPDATE USING (auth.uid() = coach_id);
CREATE POLICY "Supprimer séance" ON sessions FOR DELETE USING (auth.uid() = coach_id);

-- 3. SESSION WEIGHTS
ALTER TABLE session_weights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voir ses poids" ON session_weights;
DROP POLICY IF EXISTS "Gérer ses poids" ON session_weights;
DROP POLICY IF EXISTS "Mettre à jour poids" ON session_weights;
CREATE POLICY "Voir poids" ON session_weights FOR SELECT USING (
  auth.uid() = client_id OR
  EXISTS (SELECT 1 FROM sessions s WHERE s.id = session_id AND s.coach_id = auth.uid())
);
CREATE POLICY "Insérer poids" ON session_weights FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Modifier poids" ON session_weights FOR UPDATE USING (auth.uid() = client_id);

-- 4. MEASUREMENTS
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voir ses mesures" ON measurements;
DROP POLICY IF EXISTS "Ajouter mesure" ON measurements;
CREATE POLICY "Voir mesures" ON measurements FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach')
);
CREATE POLICY "Ajouter mesure" ON measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Modifier mesure" ON measurements FOR UPDATE USING (auth.uid() = user_id);

-- 5. CONVERSATIONS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voir ses conversations" ON conversations;
DROP POLICY IF EXISTS "Créer conversation" ON conversations;
CREATE POLICY "Voir conversations" ON conversations FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = coach_id
);
CREATE POLICY "Créer conversation" ON conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Modifier conversation" ON conversations FOR UPDATE USING (
  auth.uid() = client_id OR auth.uid() = coach_id
);

-- 6. MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voir messages" ON messages;
DROP POLICY IF EXISTS "Envoyer message" ON messages;
CREATE POLICY "Voir messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c WHERE c.id = conversation_id
    AND (c.client_id = auth.uid() OR c.coach_id = auth.uid())
  )
);
CREATE POLICY "Envoyer message" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 7. SCHEDULE EVENTS
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir planning" ON schedule_events FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = coach_id
);
CREATE POLICY "Créer créneau" ON schedule_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach')
);
CREATE POLICY "Supprimer créneau" ON schedule_events FOR DELETE USING (auth.uid() = coach_id);

-- 8. EXERCISE GIFS
ALTER TABLE exercise_gifs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir GIFs" ON exercise_gifs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Gérer GIFs" ON exercise_gifs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach')
);
