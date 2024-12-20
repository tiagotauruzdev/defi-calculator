-- Drop existing tables and triggers
DROP TRIGGER IF EXISTS update_admin_last_login ON auth.sessions;
DROP TRIGGER IF EXISTS update_configurations_updated_at ON configurations;
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
DROP FUNCTION IF EXISTS update_last_login() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP TABLE IF EXISTS configurations CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Create admins table
CREATE TABLE admins (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Enable RLS on admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admins table (allow public read access for login)
CREATE POLICY "Allow public read access for login"
    ON admins
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Insert default admin with bcrypt hash of 'admin123'
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2a$10$HrojLZslJNVf9MHl0eIlheATpnfqRAUjS76tfOVa2d9aTEL20ZMOa');

-- Create configurations table
CREATE TABLE configurations (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT REFERENCES admins(username),
    updated_by TEXT REFERENCES admins(username)
);

-- Enable RLS on configurations
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;

-- Create policy for configurations table (allow public read access)
CREATE POLICY "Allow public read access"
    ON configurations
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Create policy for configurations table (allow admin write access)
CREATE POLICY "Allow admin write access"
    ON configurations
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.username = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at on configurations
CREATE TRIGGER update_configurations_updated_at
    BEFORE UPDATE ON configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updating updated_at on admins
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert default configurations
INSERT INTO configurations (key, value, created_by, updated_by) VALUES
    ('title', '"DeFi Calculator"', 'admin', 'admin'),
    ('description', '"Calcule seus rendimentos em criptomoedas"', 'admin', 'admin'),
    ('colors', '{
        "primary": "#3B82F6",
        "secondary": "#1F2937",
        "accent": "#10B981",
        "background": "#111827",
        "text": "#F3F4F6",
        "websiteText": "#FFFFFF",
        "privacyLink": "#3B82F6",
        "termsLink": "#3B82F6",
        "footerText": "#9CA3AF",
        "buyMeACoffeeText": "#F59E0B"
    }', 'admin', 'admin'),
    ('customTexts', '{
        "title": "DeFi Calculator",
        "description": "Calcule seus rendimentos em criptomoedas",
        "footerText": "Desenvolvido por Tiago Tauruz",
        "buyMeACoffeeText": "Buy me a coffee"
    }', 'admin', 'admin'),
    ('wallet1Network', '"SOL"', 'admin', 'admin'),
    ('wallet1Address', '"sua-carteira-sol"', 'admin', 'admin'),
    ('wallet2Network', '"ETH"', 'admin', 'admin'),
    ('wallet2Address', '"sua-carteira-eth"', 'admin', 'admin'),
    ('wallet3Network', '"BTC"', 'admin', 'admin'),
    ('wallet3Address', '"sua-carteira-btc"', 'admin', 'admin'),
    ('logo', '""', 'admin', 'admin'),
    ('favicon', '""', 'admin', 'admin');
