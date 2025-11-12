const { Client } = require('pg');

const configBanco = {
    host: 'localhost',
    port: 5432,
    database: 'Trabalho_BD', 
    user: 'postgres',
    password: 'malisa' 
};

const nomeTabela = 'carros'; 

function descobrirDependencias() {
    const client = new Client(configBanco);
    
    client.connect(function(err) {
        if (err) {
            console.log("Erro ao conectar:", err.message);
            return;
        }
        
        console.log("Conectado ao banco de dados!");
        
        buscarColunas(client, nomeTabela);
    });
}

function buscarColunas(client, nomeTabela) {
    const sql = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
    `;
    
    client.query(sql, [nomeTabela], function(err, result) {
        if (err) {
            console.error("Erro ao buscar colunas:", err.message);
            client.end();
            return;
        }
        
        if (result.rows.length === 0) {
            console.log("Não achei colunas na tabela!");
            client.end();
            return;
        }
        
        const columns = [];
        for (let i = 0; i < result.rows.length; i++) {
            columns.push(result.rows[i].column_name);
        }
        
        console.log("Colunas encontradas:", columns);
        buscarDependencias(client, nomeTabela, columns);
    });
}

function buscarDependencias(client, nomeTabela, columns) {
    const dependenciasValidas = [];
    let totalTestes = 0;
    let testesCompletos = 0;
    
    function verificarSeTerminou() {
        testesCompletos++;
        if (testesCompletos === totalTestes) {
            mostrarResultados(client, nomeTabela, dependenciasValidas);
        }
    }
    
    console.log("\nProcurando dependências funcionais...");

    // Testar com 1 coluna na esquerda
    for (let i = 0; i < columns.length; i++) {
        const esquerda = [columns[i]];
        
        for (let j = 0; j < columns.length; j++) {
            const direita = columns[j];
            
            // Não testar uma coluna com ela mesma
            if (!esquerda.includes(direita)) {
                totalTestes++;
                checaDependenciaFuncional(client, nomeTabela, esquerda, direita, function(ehValida) {
                    if (ehValida) {
                        dependenciasValidas.push({ 
                            esquerda: esquerda.join(', '), 
                            direita: direita 
                        });
                    }
                    verificarSeTerminou();
                });
            }
        }
    }
    
    // Testar com 2 colunas na esquerda
    for (let i = 0; i < columns.length; i++) {
        for (let j = i + 1; j < columns.length; j++) {
            const esquerda = [columns[i], columns[j]];
            
            for (let k = 0; k < columns.length; k++) {
                const direita = columns[k];
                
                // Não testar se a direita já está na esquerda
                if (!esquerda.includes(direita)) {
                    totalTestes++;
                    checaDependenciaFuncional(client, nomeTabela, esquerda, direita, function(ehValida) {
                        if (ehValida) {
                            dependenciasValidas.push({ 
                                esquerda: esquerda.join(', '), 
                                direita: direita 
                            });
                        }
                        verificarSeTerminou();
                    });
                }
            }
        }
    }
    
    // Testar com 3 colunas na esquerda
    for (let i = 0; i < columns.length; i++) {
        for (let j = i + 1; j < columns.length; j++) {
            for (let k = j + 1; k < columns.length; k++) {
                const esquerda = [columns[i], columns[j], columns[k]];
                
                for (let l = 0; l < columns.length; l++) {
                    const direita = columns[l];
                    
                    // Não testar se a direita já está na esquerda
                    if (!esquerda.includes(direita)) {
                        totalTestes++;
                        checaDependenciaFuncional(client, nomeTabela, esquerda, direita, function(ehValida) {
                            if (ehValida) {
                                dependenciasValidas.push({ 
                                    esquerda: esquerda.join(', '), 
                                    direita: direita 
                                });
                            }
                            verificarSeTerminou();
                        });
                    }
                }
            }
        }
    }
    
    console.log("Total de testes a fazer:", totalTestes);
}

function checaDependenciaFuncional(client, nomeTabela, esquerda, direita, callback) {
    const leString = esquerda.join(', ');
    
    const sql = `
        SELECT ${leString}, COUNT(DISTINCT ${direita}) as distinct_ld_count
        FROM ${nomeTabela}
        GROUP BY ${leString}
        HAVING COUNT(DISTINCT ${direita}) > 1
    `;

    client.query(sql, function(err, result) {
        if (err) {
            console.error(`Erro testando [${leString}] -> [${direita}]:`, err.message);
            callback(false);
        } else {
            // Se não achou nenhum problema, a dependência é válida
            if (result.rows.length === 0) {
                callback(true);
            } else {
                callback(false);
            }
        }
    });
}

function mostrarResultados(client, nomeTabela, dependenciasValidas) {
    // Mostrar resultados
    console.log("\n=== RESULTADOS ===");
    console.log("Tabela: " + nomeTabela);
    console.log("Dependências válidas encontradas: " + dependenciasValidas.length);
    console.log("==================");
    
    for (let i = 0; i < dependenciasValidas.length; i++) {
        const dep = dependenciasValidas[i];
        console.log("[" + dep.esquerda + "] -> [" + dep.direita + "]");
    }
    
    client.end(function(err) {
        if (err) {
            console.log("Erro ao desconectar:", err.message);
        } else {
            console.log("\nEncerrando Conexão com o Banco de Dados.");
        }
    });
}

descobrirDependencias();