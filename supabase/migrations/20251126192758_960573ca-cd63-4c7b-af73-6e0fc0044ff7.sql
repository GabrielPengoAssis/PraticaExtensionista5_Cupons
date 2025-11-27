-- Permitir que associados removam seus próprios cupons reservados
CREATE POLICY "Associados podem deletar seus cupons reservados"
ON cupom_associado
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM associado
    WHERE associado.user_id = auth.uid()
    AND associado.cpf_associado = cupom_associado.cpf_associado
  )
);