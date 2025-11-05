CREATE TABLE carros (
    placa VARCHAR(10) PRIMARY KEY,
    modelo VARCHAR(50) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    ano INT NOT NULL
);

-- ==========================
-- Inserção de registros de teste (20 linhas)
-- ==========================
INSERT INTO carros (placa, modelo, marca, ano) VALUES
('ABC1A23', 'Onix', 'Chevrolet', 2020),
('BCD2B34', 'Onix', 'Chevrolet', 2021),
('CDE3C45', 'Civic', 'Honda', 2019),
('DEF4D56', 'Civic', 'Honda', 2022),
('EFG5E67', 'Corolla', 'Toyota', 2018),
('FGH6F78', 'Corolla', 'Toyota', 2023),
('GHI7G89', 'Gol', 'Volkswagen', 2017),
('HIJ8H90', 'Gol', 'Volkswagen', 2020),
('IJK9I01', 'Uno', 'Fiat', 2015),
('JKL0J12', 'Uno', 'Fiat', 2018),
('KLM1K23', 'HB20', 'Hyundai', 2020),
('LMN2L34', 'HB20', 'Hyundai', 2022),
('MNO3M45', 'Ranger', 'Ford', 2021),
('NOP4N56', 'Ranger', 'Ford', 2022),
('OPQ5O67', 'Argo', 'Fiat', 2020),
('PQR6P78', 'Argo', 'Fiat', 2023),
('QRS7Q89', 'Compass', 'Jeep', 2021),
('RST8R90', 'Compass', 'Jeep', 2022),
('STU9S01', 'Kwid', 'Renault', 2019),
('TUV0T12', 'Kwid', 'Renault', 2020);
