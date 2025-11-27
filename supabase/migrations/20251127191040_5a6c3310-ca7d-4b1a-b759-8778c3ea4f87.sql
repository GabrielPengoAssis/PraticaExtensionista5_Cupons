-- Corrigir política RLS para permitir que comerciantes vejam cupons reservados dos seus estabelecimentos
DROP POLICY IF EXISTS "Comerciantes podem ver cupons reservados de seus estabeleciment" ON cupom_associado;

CREATE POLICY "Comerciantes podem ver cupons reservados de seus estabelecimentos"
ON cupom_associado
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM cupom
    JOIN comercio ON comercio.cnpj_comercio = cupom.cnpj_comercio
    WHERE cupom.num_cupom = cupom_associado.num_cupom 
    AND comercio.user_id = auth.uid()
  )
);