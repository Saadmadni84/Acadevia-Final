-- States
INSERT INTO states (name, code, region, default_language) VALUES 
('Andhra Pradesh', 'AP', 'SOUTH', 'te'),
('Arunachal Pradesh', 'AR', 'NORTHEAST', 'en'),
('Assam', 'AS', 'NORTHEAST', 'as'),
('Bihar', 'BR', 'EAST', 'hi'),
('Chhattisgarh', 'CG', 'CENTRAL', 'hi'),
('Goa', 'GA', 'WEST', 'kok'),
('Gujarat', 'GJ', 'WEST', 'gu'),
('Haryana', 'HR', 'NORTH', 'hi'),
('Himachal Pradesh', 'HP', 'NORTH', 'hi'),
('Jharkhand', 'JH', 'EAST', 'hi'),
('Karnataka', 'KA', 'SOUTH', 'kn'),
('Kerala', 'KL', 'SOUTH', 'ml'),
('Madhya Pradesh', 'MP', 'CENTRAL', 'hi'),
('Maharashtra', 'MH', 'WEST', 'mr'),
('Manipur', 'MN', 'NORTHEAST', 'mni'),
('Meghalaya', 'ML', 'NORTHEAST', 'en'),
('Mizoram', 'MZ', 'NORTHEAST', 'or'),
('Nagaland', 'NL', 'NORTHEAST', 'en'),
('Odisha', 'OD', 'EAST', 'or'),
('Punjab', 'PB', 'NORTH', 'pa'),
('Rajasthan', 'RJ', 'NORTH', 'hi'),
('Sikkim', 'SK', 'NORTHEAST', 'en'),
('Tamil Nadu', 'TN', 'SOUTH', 'ta'),
('Telangana', 'TG', 'SOUTH', 'te'),
('Tripura', 'TR', 'NORTHEAST', 'bn'),
('Uttar Pradesh', 'UP', 'NORTH', 'hi'),
('Uttarakhand', 'UK', 'NORTH', 'hi'),
('West Bengal', 'WB', 'EAST', 'bn'),
('Delhi', 'DL', 'NORTH', 'hi');

-- Cities (Example data for Maharashtra and Delhi)
INSERT INTO cities (name, state_id, district, tier, pincode) 
SELECT 'Mumbai', id, 'Mumbai City', 'TIER_1', '400001' FROM states WHERE code = 'MH';

INSERT INTO cities (name, state_id, district, tier, pincode) 
SELECT 'Pune', id, 'Pune', 'TIER_1', '411001' FROM states WHERE code = 'MH';

INSERT INTO cities (name, state_id, district, tier, pincode) 
SELECT 'Nagpur', id, 'Nagpur', 'TIER_2', '440001' FROM states WHERE code = 'MH';

INSERT INTO cities (name, state_id, district, tier, pincode) 
SELECT 'New Delhi', id, 'New Delhi', 'TIER_1', '110001' FROM states WHERE code = 'DL';

INSERT INTO cities (name, state_id, district, tier, pincode) 
SELECT 'Bangalore', id, 'Bangalore Urban', 'TIER_1', '560001' FROM states WHERE code = 'KA';

INSERT INTO cities (name, state_id, district, tier, pincode) 
SELECT 'Hyderabad', id, 'Hyderabad', 'TIER_1', '500001' FROM states WHERE code = 'TG';

INSERT INTO cities (name, state_id, district, tier, pincode) 
SELECT 'Chennai', id, 'Chennai', 'TIER_1', '600001' FROM states WHERE code = 'TN';

INSERT INTO cities (name, state_id, district, tier, pincode) 
SELECT 'Kolkata', id, 'Kolkata', 'TIER_1', '700001' FROM states WHERE code = 'WB';
