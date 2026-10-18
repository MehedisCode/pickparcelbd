<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use PDO;

class InspectLegacySchema extends Command
{
    protected $signature = 'pickparcel:legacy-schema';

    protected $description = 'Read legacy MariaDB metadata into private storage; never import or change source data';

    public function handle(): int
    {
        $c = config('legacy');
        if (empty($c['host']) || empty($c['database']) || empty($c['username'])) {
            $this->error('Configure LEGACY_DB_HOST, LEGACY_DB_DATABASE and a SELECT-only LEGACY_DB_USERNAME in the private .env file.');

            return self::FAILURE;
        }
        try {
            $pdo = new PDO('mysql:host='.$c['host'].';port='.(int) $c['port'].';dbname='.$c['database'].';charset=utf8mb4', $c['username'], $c['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
            $pdo->exec('SET SESSION TRANSACTION READ ONLY');
            $pdo->beginTransaction();
            $queries = [
                'columns' => 'SELECT TABLE_NAME,COLUMN_NAME,ORDINAL_POSITION,COLUMN_TYPE,IS_NULLABLE,COLUMN_KEY,EXTRA FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME,ORDINAL_POSITION',
                'indexes' => 'SELECT TABLE_NAME,INDEX_NAME,NON_UNIQUE,SEQ_IN_INDEX,COLUMN_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME,INDEX_NAME,SEQ_IN_INDEX',
                'relations' => 'SELECT TABLE_NAME,COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=? AND REFERENCED_TABLE_NAME IS NOT NULL ORDER BY TABLE_NAME,COLUMN_NAME',
            ];
            $result = ['captured_at' => now()->toIso8601String(), 'source' => 'legacy', 'contains' => 'schema metadata only'];
            foreach ($queries as $key => $sql) {
                $q = $pdo->prepare($sql);
                $q->execute([$c['database']]);
                $result[$key] = $q->fetchAll();
            }
            $pdo->rollBack();
            abort_if(empty($result['columns']), 422, 'No legacy tables were visible to this account.');
            $path = storage_path('app/private/legacy-schema.json');
            File::ensureDirectoryExists(dirname($path), 0700);
            File::put($path, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
            chmod($path, 0600);
            $this->info(count(array_unique(array_column($result['columns'], 'TABLE_NAME'))).' table definitions saved to private storage. No records were read or imported.');

            return self::SUCCESS;
        } catch (\Throwable $e) {
            // Connection exceptions can include server/account details. Do not
            // print them or write configuration into a migration artifact.
            $this->error('Schema inspection failed. Verify the read-only connection configuration and access locally.');

            return self::FAILURE;
        }
    }
}
