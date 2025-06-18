-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    isVerified BOOLEAN DEFAULT FALSE,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- VAULTS TABLE
CREATE TABLE vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    encryption_key TEXT,
    deadman_trigger INTEGER,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('active', 'sealed', 'delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP WITH TIME ZONE
);

-- VAULT_FOLDERS TABLE
CREATE TABLE vault_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- VAULT_ENTRIES TABLE
CREATE TABLE vault_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID REFERENCES vault_folders(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('text', 'file', 'audio', 'video')),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    encrypted BOOLEAN DEFAULT TRUE,
    attachments TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CONTACTS TABLE
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) CHECK (role IN ('next-of-kin', 'witness', 'executor', 'friend', 'family')),
    verified BOOLEAN DEFAULT FALSE,
    vault_count INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- VAULT_RECIPIENTS TABLE
CREATE TABLE vault_recipients (
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (vault_id, contact_id)
);

-- DEADMAN SETTINGS
CREATE TABLE vault_deadman_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    check_in_frequency INTEGER NOT NULL,
    last_check_in TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_check_in TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    auto_deliver BOOLEAN DEFAULT TRUE,
    delivery_delay INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vault_id)
);

-- CHECK-IN HISTORY
CREATE TABLE vault_check_in_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_in_method VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) CHECK (status IN ('success', 'missed', 'late'))
);

-- INDEXES
CREATE INDEX idx_vaults_user_id ON vaults(user_id);
CREATE INDEX idx_vault_folders_vault_id ON vault_folders(vault_id);
CREATE INDEX idx_vault_entries_folder_id ON vault_entries(folder_id);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_vault_recipients_vault_id ON vault_recipients(vault_id);
CREATE INDEX idx_vault_recipients_contact_id ON vault_recipients(contact_id);
CREATE INDEX idx_vault_deadman_settings_vault_id ON vault_deadman_settings(vault_id);
CREATE INDEX idx_vault_deadman_settings_next_check_in ON vault_deadman_settings(next_check_in) WHERE is_active = TRUE;
CREATE INDEX idx_vault_check_in_history_vault_id ON vault_check_in_history(vault_id);

-- TIMESTAMP TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- TRIGGERS
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vaults_updated_at BEFORE UPDATE ON vaults FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vault_folders_updated_at BEFORE UPDATE ON vault_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vault_deadman_settings_updated_at BEFORE UPDATE ON vault_deadman_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- USER CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, isVerified)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create user record
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a trigger to handle email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.users
    SET isVerified = true
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_email_confirmation();

-- ENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_deadman_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_check_in_history ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- USERS
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- VAULTS
CREATE POLICY "Users can view their own vaults" ON vaults FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vaults" ON vaults FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vaults" ON vaults FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vaults" ON vaults FOR DELETE USING (auth.uid() = user_id);

-- VAULT_FOLDERS
CREATE POLICY "Users can view their vault folders" ON vault_folders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_folders.vault_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert their vault folders" ON vault_folders FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_folders.vault_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update their vault folders" ON vault_folders FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_folders.vault_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete their vault folders" ON vault_folders FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_folders.vault_id AND vaults.user_id = auth.uid()
    )
);

-- VAULT_ENTRIES
CREATE POLICY "Users can view their vault entries" ON vault_entries FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM vault_folders
        JOIN vaults ON vaults.id = vault_folders.vault_id
        WHERE vault_folders.id = vault_entries.folder_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert their vault entries" ON vault_entries FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM vault_folders
        JOIN vaults ON vaults.id = vault_folders.vault_id
        WHERE vault_folders.id = vault_entries.folder_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update their vault entries" ON vault_entries FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM vault_folders
        JOIN vaults ON vaults.id = vault_folders.vault_id
        WHERE vault_folders.id = vault_entries.folder_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete their vault entries" ON vault_entries FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM vault_folders
        JOIN vaults ON vaults.id = vault_folders.vault_id
        WHERE vault_folders.id = vault_entries.folder_id AND vaults.user_id = auth.uid()
    )
);

-- CONTACTS
CREATE POLICY "Users can view their contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);

-- VAULT_RECIPIENTS
CREATE POLICY "Users can view their vault recipients" ON vault_recipients FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_recipients.vault_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert their vault recipients" ON vault_recipients FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_recipients.vault_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete their vault recipients" ON vault_recipients FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_recipients.vault_id AND vaults.user_id = auth.uid()
    )
);

-- DEADMAN SETTINGS
CREATE POLICY "Users can view their vault deadman settings" ON vault_deadman_settings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_deadman_settings.vault_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert their vault deadman settings" ON vault_deadman_settings FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_deadman_settings.vault_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update their vault deadman settings" ON vault_deadman_settings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_deadman_settings.vault_id AND vaults.user_id = auth.uid()
    )
);

-- CHECK-IN HISTORY
CREATE POLICY "Users can view their vault check-in history" ON vault_check_in_history FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_check_in_history.vault_id AND vaults.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert their vault check-in history" ON vault_check_in_history FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM vaults WHERE vaults.id = vault_check_in_history.vault_id AND vaults.user_id = auth.uid()
    )
);
