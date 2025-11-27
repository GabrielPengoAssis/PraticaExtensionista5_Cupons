-- Corrigir função para verificar se cupom pertence ao comerciante
CREATE OR REPLACE FUNCTION public.cupom_pertence_ao_comercio(cupom_cnpj bigint, usuario_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM comercio 
    WHERE cnpj_comercio = cupom_cnpj 
    AND user_id::text = usuario_id
  )
$$;

-- Remover política antiga de inserção
DROP POLICY IF EXISTS "Comerciantes podem criar cupons" ON cupom;

-- Criar nova política de inserção corrigida
CREATE POLICY "Comerciantes podem criar cupons"
ON cupom
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM comercio 
    WHERE cnpj_comercio = cupom.cnpj_comercio 
    AND user_id = auth.uid()
  )
);

-- Remover e recriar política de atualização também
DROP POLICY IF EXISTS "Comerciantes podem atualizar seus cupons" ON cupom;

CREATE POLICY "Comerciantes podem atualizar seus cupons"
ON cupom
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM comercio 
    WHERE cnpj_comercio = cupom.cnpj_comercio 
    AND user_id = auth.uid()
  )
);