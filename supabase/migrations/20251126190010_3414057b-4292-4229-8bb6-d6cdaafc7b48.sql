-- Corrigir função para verificar se associado pode ver cupom
CREATE OR REPLACE FUNCTION public.pode_ver_cupom(cupom_num character, usuario_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Retorna true se o cupom não está reservado (disponível para todos)
  -- OU se está reservado para este usuário (comparando via user_id da tabela associado)
  SELECT NOT EXISTS (
    SELECT 1 FROM cupom_associado WHERE num_cupom = cupom_num
  ) OR EXISTS (
    SELECT 1 FROM cupom_associado ca
    JOIN associado a ON a.cpf_associado = ca.cpf_associado
    WHERE ca.num_cupom = cupom_num 
    AND a.user_id::text = usuario_id
  )
$$;