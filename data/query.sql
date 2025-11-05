--certo modelo determina marca 
SELECT modelo, marca
SELECT modelo
FROM carros
GROUP BY modelo
HAVING COUNT(DISTINCT marca) > 1;FROM carros
ORDER BY modelo;


--consulta errada ano nao depende de modelo
SELECT ano
FROM carros
GROUP BY ano
HAVING COUNT(DISTINCT modelo) > 1;
