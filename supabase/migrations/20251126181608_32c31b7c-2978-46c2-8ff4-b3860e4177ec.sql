-- Remove políticas problemáticas
DROP POLICY IF EXISTS "Associados podem ver cupons disponíveis e seus cupons reservad" ON cupom;
DROP POLICY IF EXISTS "Comerciantes podem ver seus próprios cupons" ON cupom;

-- Criar função security definer para verificar se cupom está disponível ou pertence ao usuário
CREATE OR REPLACE FUNCTION public.pode_ver_cupom(cupom_num character, usuario_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Retorna true se o cupom não está reservado OU se está reservado para este usuário
  SELECT NOT EXISTS (
    SELECT 1 FROM cupom_associado WHERE num_cupom = cupom_num
  ) OR EXISTS (
    SELECT 1 FROM cupom_associado 
    WHERE num_cupom = cupom_num AND cpf_associado::text = usuario_id
  )
$$;

-- Criar função security definer para verificar se usuário é dono do comercio
CREATE OR REPLACE FUNCTION public.cupom_pertence_ao_comercio(cupom_cnpj bigint, usuario_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cupom_cnpj::text = usuario_id
$$;

-- Recriar políticas usando as funções security definer
CREATE POLICY "Associados podem ver cupons disponíveis e reservados por eles"
ON cupom
FOR SELECT
TO authenticated
USING (public.pode_ver_cupom(num_cupom, auth.uid()::text));

CREATE POLICY "Comerciantes podem ver seus próprios cupons"
ON cupom
FOR SELECT
TO authenticated
USING (public.cupom_pertence_ao_comercio(cnpj_comercio, auth.uid()::text));