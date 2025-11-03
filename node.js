// Descoberta de Dependências Funcionais
// Instalar: npm install pg (PostgreSQL) ou npm install mysql2 (MySQL)

const { Client } = require('pg'); // Para PostgreSQL
// const mysql = require('mysql2/promise'); // Para MySQL

// ==================== CONFIGURAÇÃO DO BANCO ====================
const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'seu_banco',
    user: 'seu_usuario',
    password: 'sua_senha'
};

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Gera todas as combinações de K elementos de um array
 */
function getCombinations(arr, k) {
    if (k === 1) return arr.map(el => [el]);
    
    const combinations = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = arr.slice(i + 1);
        const restCombinations = getCombinations(rest, k - 1);
        for (const combination of restCombinations) {
            combinations.push([arr[i], ...combination]);
        }
    }
    return combinations;
}

/**
 * Obtém todas as colunas de uma tabela
 */
async function getTableColumns(client, tableName) {
    const query = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
    `;
    const result = await client.query(query, [tableName]);
    return result.rows.map(row => row.column_name);
}

/**
 * Verifica se uma dependência funcional X -> Y é válida
 * Retorna true se válida, false caso contrário
 */
async function checkFunctionalDependency(client, tableName, leftSide, rightSide) {
    // Monta a lista de colunas do lado esquerdo
    const leftColumns = leftSide.join(', ');
    
    // Query que verifica se existem grupos com mais de 1 valor distinto no lado direito
    const query = `
        SELECT ${leftColumns}, COUNT(DISTINCT ${rightSide}) as distinct_count
        FROM ${tableName}
        WHERE ${rightSide} IS NOT NULL
        GROUP BY ${leftColumns}
        HAVING COUNT(DISTINCT ${rightSide}) > 1
        LIMIT 1
    `;
    
    try {
        const result = await client.query(query);
        // Se não retornou nenhuma linha, a dependência é válida
        return result.rows.length === 0;
    } catch (error) {
        console.error(`Erro ao testar ${leftColumns} -> ${rightSide}:`, error.message);
        return false;
    }
}

/**
 * Descobre todas as dependências funcionais válidas
 */
async function discoverFunctionalDependencies(client, tableName, maxLeftSize = 3) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Analisando tabela: ${tableName}`);
    console.log(`${'='.repeat(60)}\n`);
    
    const startTime = Date.now();
    
    // 1. Obter todas as colunas da tabela
    const columns = await getTableColumns(client, tableName);
    console.log(`Colunas encontradas: ${columns.join(', ')}`);
    console.log(`Total de colunas: ${columns.length}\n`);
    
    const validDependencies = [];
    let totalTests = 0;
    
    // 2. Testar dependências com 1 até maxLeftSize atributos no lado esquerdo
    for (let leftSize = 1; leftSize <= maxLeftSize; leftSize++) {
        console.log(`\nTestando dependências com ${leftSize} atributo(s) no lado esquerdo...`);
        
        // Gerar todas as combinações de leftSize colunas
        const leftCombinations = getCombinations(columns, leftSize);
        
        for (const leftSide of leftCombinations) {
            // Para cada combinação do lado esquerdo, testar com cada coluna do lado direito
            for (const rightCol of columns) {
                // Não testar se a coluna do lado direito está no lado esquerdo
                if (leftSide.includes(rightCol)) continue;
                
                totalTests++;
                const isValid = await checkFunctionalDependency(client, tableName, leftSide, rightCol);
                
                if (isValid) {
                    const dependency = {
                        left: leftSide,
                        right: rightCol,
                        notation: `{${leftSide.join(', ')}} -> ${rightCol}`
                    };
                    validDependencies.push(dependency);
                    console.log(`✓ Encontrada: ${dependency.notation}`);
                }
            }
        }
    }
    
    const endTime = Date.now();
    const executionTime = ((endTime - startTime) / 1000).toFixed(2);
    
    // 3. Exibir resultados
    console.log(`\n${'='.repeat(60)}`);
    console.log('RESULTADOS FINAIS');
    console.log(`${'='.repeat(60)}\n`);
    
    console.log('Dependências Funcionais Válidas Encontradas:\n');
    
    if (validDependencies.length === 0) {
        console.log('Nenhuma dependência funcional encontrada.');
    } else {
        // Agrupar por tamanho do lado esquerdo
        for (let size = 1; size <= maxLeftSize; size++) {
            const depsOfSize = validDependencies.filter(d => d.left.length === size);
            if (depsOfSize.length > 0) {
                console.log(`\nCom ${size} atributo(s) no lado esquerdo:`);
                depsOfSize.forEach(dep => {
                    console.log(`  ${dep.notation}`);
                });
            }
        }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('ESTATÍSTICAS');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total de testes executados: ${totalTests}`);
    console.log(`Dependências válidas encontradas: ${validDependencies.length}`);
    console.log(`Tempo de execução: ${executionTime} segundos`);
    console.log(`${'='.repeat(60)}\n`);
    
    return {
        dependencies: validDependencies,
        totalTests,
        executionTime,
        columns: columns.length
    };
}

/**
 * Calcula quantos testes serão necessários (complexidade)
 */
function calculateTotalTests(numColumns, maxLeftSize) {
    let total = 0;
    
    for (let k = 1; k <= maxLeftSize; k++) {
        // Combinações de k elementos: C(n, k)
        const combinations = factorial(numColumns) / (factorial(k) * factorial(numColumns - k));
        // Para cada combinação, testamos com (n - k) colunas no lado direito
        total += combinations * (numColumns - k);
    }
    
    return total;
}

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// ==================== FUNÇÃO PRINCIPAL ====================

async function main() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('Conectado ao banco de dados!\n');
        
        // Escolha a tabela para analisar
        const tableName = 'alunos'; // Altere para 'funcionarios' ou 'produtos'
        
        // Descobre as dependências
        const results = await discoverFunctionalDependencies(client, tableName, 3);
        
        // Análise de complexidade
        console.log('\n' + '='.repeat(60));
        console.log('ANÁLISE DE COMPLEXIDADE');
        console.log('='.repeat(60));
        console.log(`\nPara uma tabela com ${results.columns} colunas:`);
        console.log(`Testes realizados: ${results.totalTests}`);
        console.log(`Testes calculados: ${calculateTotalTests(results.columns, 3)}`);
        
        console.log('\nSimulação para tabelas maiores:');
        for (const n of [10, 15, 20]) {
            const tests = calculateTotalTests(n, 3);
            console.log(`  ${n} colunas: ${tests.toLocaleString()} testes`);
        }
        
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await client.end();
        console.log('\nConexão encerrada.');
    }
}

// Executar o programa
main();