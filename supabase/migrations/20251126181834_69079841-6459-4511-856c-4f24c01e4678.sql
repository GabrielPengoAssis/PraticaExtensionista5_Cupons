-- Adicionar campo user_id nas tabelas associado e comercio
ALTER TABLE public.associado ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.comercio ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índices para melhor performance
CREATE INDEX idx_associado_user_id ON public.associado(user_id);
CREATE INDEX idx_comercio_user_id ON public.comercio(user_id);

-- Atualizar políticas RLS para associado
DROP POLICY IF EXISTS "Associados podem atualizar seus próprios dados" ON associado;
DROP POLICY IF EXISTS "Associados podem ver seus próprios dados" ON associado;

CREATE POLICY "Associados podem ver seus próprios dados"
ON associado FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Associados podem atualizar seus próprios dados"
ON associado FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Atualizar políticas RLS para comercio
DROP POLICY IF EXISTS "Comércios podem atualizar seus próprios dados" ON comercio;
DROP POLICY IF EXISTS "Comércios podem ver seus próprios dados" ON comercio;

CREATE POLICY "Comércios podem ver seus próprios dados"
ON comercio FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Comércios podem atualizar seus próprios dados"
ON comercio FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Atualizar políticas para cupom_associado
DROP POLICY IF EXISTS "Associados podem reservar cupons" ON cupom_associado;
DROP POLICY IF EXISTS "Associados podem ver seus cupons reservados" ON cupom_associado;

-- Criar função para verificar se usuário é associado
CREATE OR REPLACE FUNCTION public.is_associado(usuario_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM associado WHERE user_id = usuario_id
  )
$$;

-- Criar função para verificar se usuário é comerciante
CREATE OR REPLACE FUNCTION public.is_comerciante(usuario_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM comercio WHERE user_id = usuario_id
  )
$$;

CREATE POLICY "Associados podem reservar cupons"
ON cupom_associado FOR INSERT
TO authenticated
WITH CHECK (public.is_associado(auth.uid()));

CREATE POLICY "Associados podem ver seus cupons reservados"
ON cupom_associado FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM associado 
    WHERE associado.user_id = auth.uid() 
    AND associado.cpf_associado = cupom_associado.cpf_associado
  )
);