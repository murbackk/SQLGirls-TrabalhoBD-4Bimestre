--certo modelo determina marca 
-- se retornar 0 linhas, a dependência é VÁLIDA.
SELECT modelo, COUNT(DISTINCT marca) AS marcas_distintas
FROM carros
GROUP BY modelo
HAVING COUNT(DISTINCT marca) > 1;


--consulta errada ano nao depende de modelo
-- se retornar > 0 linhas, a dependência é INVÁLIDA.
SELECT ano, COUNT(DISTINCT modelo) AS modelos_distintos
FROM carros
GROUP BY ano
HAVING COUNT(DISTINCT modelo) > 1;
