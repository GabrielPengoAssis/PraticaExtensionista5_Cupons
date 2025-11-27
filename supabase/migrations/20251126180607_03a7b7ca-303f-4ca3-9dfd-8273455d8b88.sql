-- Tabela de Categorias de Estabelecimentos
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria SERIAL PRIMARY KEY,
    nom_categoria VARCHAR(25) NOT NULL UNIQUE
);

-- Inserir categorias iniciais
INSERT INTO categoria (nom_categoria) VALUES
    ('Alimentação'),
    ('Vestuário'),
    ('Saúde e Beleza'),
    ('Serviços'),
    ('Educação'),
    ('Entretenimento'),
    ('Automotivo'),
    ('Outros')
ON CONFLICT (nom_categoria) DO NOTHING;

-- Tabela de Associados (Moradores)
CREATE TABLE IF NOT EXISTS associado (
    cpf_associado BIGINT PRIMARY KEY,
    nom_associado VARCHAR(40) NOT NULL,
    dta_associado DATE NOT NULL,
    end_associado VARCHAR(40) NOT NULL,
    bai_associado VARCHAR(30) NOT NULL,
    cep_associado VARCHAR(8) NOT NULL,
    cid_associado VARCHAR(40) NOT NULL,
    uf_associado CHAR(2) NOT NULL,
    cel_associado VARCHAR(15) NOT NULL,
    email_associado VARCHAR(50) NOT NULL UNIQUE,
    sen_associado VARCHAR(255) NOT NULL
);

-- Tabela de Comércios
CREATE TABLE IF NOT EXISTS comercio (
    cnpj_comercio BIGINT PRIMARY KEY,
    id_categoria INTEGER NOT NULL,
    raz_social_comercio VARCHAR(50) NOT NULL,
    nom_fantasia_comercio VARCHAR(30) NOT NULL,
    end_comercio VARCHAR(40) NOT NULL,
    bai_comercio VARCHAR(30) NOT NULL,
    cep_comercio VARCHAR(8) NOT NULL,
    cid_comercio VARCHAR(40) NOT NULL,
    uf_comercio CHAR(2) NOT NULL,
    con_comercio VARCHAR(15) NOT NULL,
    email_comercio VARCHAR(50) NOT NULL UNIQUE,
    sen_comercio VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabela de Cupons
CREATE TABLE IF NOT EXISTS cupom (
    num_cupom CHAR(12) PRIMARY KEY,
    cnpj_comercio BIGINT NOT NULL,
    tit_cupom VARCHAR(25) NOT NULL,
    dta_emissao_cupom DATE NOT NULL,
    dta_inicio_cupom DATE NOT NULL,
    dta_termino_cupom DATE NOT NULL,
    per_desc_cupom NUMERIC(5,2) NOT NULL,
    FOREIGN KEY (cnpj_comercio) REFERENCES comercio(cnpj_comercio) ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (dta_termino_cupom > dta_inicio_cupom),
    CHECK (dta_inicio_cupom >= dta_emissao_cupom),
    CHECK (per_desc_cupom > 0 AND per_desc_cupom <= 100)
);

-- Tabela de Cupons Reservados por Associados
CREATE TABLE IF NOT EXISTS cupom_associado (
    id_cupom_associado SERIAL PRIMARY KEY,
    num_cupom CHAR(12) NOT NULL UNIQUE,
    cpf_associado BIGINT NOT NULL,
    dta_cupom_associado DATE NOT NULL,
    dta_uso_cupom_associado DATE NULL,
    FOREIGN KEY (num_cupom) REFERENCES cupom(num_cupom) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (cpf_associado) REFERENCES associado(cpf_associado) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_cupom_comercio ON cupom(cnpj_comercio);
CREATE INDEX IF NOT EXISTS idx_cupom_datas ON cupom(dta_inicio_cupom, dta_termino_cupom);
CREATE INDEX IF NOT EXISTS idx_cupom_associado_cpf ON cupom_associado(cpf_associado);
CREATE INDEX IF NOT EXISTS idx_cupom_associado_num ON cupom_associado(num_cupom);
CREATE INDEX IF NOT EXISTS idx_cupom_associado_uso ON cupom_associado(dta_uso_cupom_associado);
CREATE INDEX IF NOT EXISTS idx_comercio_categoria ON comercio(id_categoria);

-- Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE associado ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercio ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupom ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupom_associado ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Categoria (leitura pública)
CREATE POLICY "Categorias são visíveis para todos"
    ON categoria FOR SELECT
    USING (true);

-- Políticas RLS para Associado
CREATE POLICY "Associados podem ver seus próprios dados"
    ON associado FOR SELECT
    USING (auth.uid()::text = cpf_associado::text);

CREATE POLICY "Associados podem atualizar seus próprios dados"
    ON associado FOR UPDATE
    USING (auth.uid()::text = cpf_associado::text);

CREATE POLICY "Qualquer pessoa pode criar conta de associado"
    ON associado FOR INSERT
    WITH CHECK (true);

-- Políticas RLS para Comercio
CREATE POLICY "Comércios podem ver seus próprios dados"
    ON comercio FOR SELECT
    USING (auth.uid()::text = cnpj_comercio::text);

CREATE POLICY "Comércios podem atualizar seus próprios dados"
    ON comercio FOR UPDATE
    USING (auth.uid()::text = cnpj_comercio::text);

CREATE POLICY "Qualquer pessoa pode criar conta de comerciante"
    ON comercio FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Associados podem ver informações básicas de comércios"
    ON comercio FOR SELECT
    USING (true);

-- Políticas RLS para Cupom
CREATE POLICY "Comerciantes podem ver seus próprios cupons"
    ON cupom FOR SELECT
    USING (auth.uid()::text = cnpj_comercio::text);

CREATE POLICY "Comerciantes podem criar cupons"
    ON cupom FOR INSERT
    WITH CHECK (auth.uid()::text = cnpj_comercio::text);

CREATE POLICY "Comerciantes podem atualizar seus cupons"
    ON cupom FOR UPDATE
    USING (auth.uid()::text = cnpj_comercio::text);

CREATE POLICY "Associados podem ver cupons disponíveis e seus cupons reservados"
    ON cupom FOR SELECT
    USING (
        -- Cupom disponível (não está em cupom_associado)
        NOT EXISTS (SELECT 1 FROM cupom_associado WHERE cupom_associado.num_cupom = cupom.num_cupom)
        OR
        -- Ou cupom pertence ao associado
        EXISTS (
            SELECT 1 FROM cupom_associado 
            WHERE cupom_associado.num_cupom = cupom.num_cupom 
            AND cupom_associado.cpf_associado::text = auth.uid()::text
        )
    );

-- Políticas RLS para Cupom_Associado
CREATE POLICY "Associados podem ver seus cupons reservados"
    ON cupom_associado FOR SELECT
    USING (auth.uid()::text = cpf_associado::text);

CREATE POLICY "Associados podem reservar cupons"
    ON cupom_associado FOR INSERT
    WITH CHECK (auth.uid()::text = cpf_associado::text);

CREATE POLICY "Comerciantes podem ver cupons reservados de seus estabelecimentos"
    ON cupom_associado FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM cupom 
            WHERE cupom.num_cupom = cupom_associado.num_cupom 
            AND cupom.cnpj_comercio::text = auth.uid()::text
        )
    );

CREATE POLICY "Comerciantes podem registrar uso de cupons"
    ON cupom_associado FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM cupom 
            WHERE cupom.num_cupom = cupom_associado.num_cupom 
            AND cupom.cnpj_comercio::text = auth.uid()::text
        )
    );