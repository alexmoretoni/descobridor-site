import {z} from 'zod';

export const branch=z.string().regex(/^(?:mcp\/[a-zA-Z0-9][a-zA-Z0-9/_-]{0,100})$/).refine(v=>!v.includes('..')&&!v.endsWith('/'),'Branch inválida');
export const sha=z.string().regex(/^[a-f0-9]{40}$/);
export const sourcePath=z.string().min(1).max(240).refine(v=>!v.startsWith('/')&&!v.includes('\\')&&!v.split('/').some(p=>!p||p==='.'||p==='..')&&!v.split('/').some(p=>/^\.env|^\.dev\.vars|^\.git$|^node_modules$|^dist$|^\.wrangler$|^\.sites-runtime$|\.(pem|key)$/i.test(p)),'Caminho de código inválido ou reservado');
const s=z.string().min(1).max(200),limit=z.number().int().min(1).max(100).default(50),offset=z.number().int().min(0).max(1000000).default(0);
export const tables=['orders','leads','profiles','customers','consultations','packages'] as const;
const file=z.object({path:sourcePath,content:z.string().max(150000).nullable()}).strict();
export const extensionSchemas={
 get_repository_status:z.object({}).strict(),
 list_source_files:z.object({ref:z.string().max(120).optional(),prefix:z.string().max(200).default('')}).strict(),
 read_source_file:z.object({path:sourcePath,ref:z.string().max(120).optional()}).strict(),
 write_source_file:z.object({branch,path:sourcePath,content:z.string().max(150000),sha,message:s}).strict(),
 create_source_file:z.object({branch,path:sourcePath,content:z.string().max(150000),message:s}).strict(),
 delete_source_file:z.object({branch,path:sourcePath,sha,message:s}).strict(),
 create_branch:z.object({branch,fromSha:sha}).strict(),
 create_commit:z.object({branch,expectedSha:sha,message:s,files:z.array(file).min(1).max(20)}).strict(),
 create_pull_request:z.object({branch,title:s,body:z.string().max(10000).default('')}).strict(),
 compare_changes:z.object({branch}).strict(),
 run_typecheck:z.object({branch,sha}).strict(),run_tests:z.object({branch,sha}).strict(),run_build:z.object({branch,sha}).strict(),
 get_build_logs:z.object({runId:z.number().int().positive()}).strict(),
 list_build_runs:z.object({sha:sha.optional()}).strict(),
 create_backup:z.object({label:s}).strict(),list_versions:z.object({}).strict(),
 rollback_version:z.object({versionId:z.string().uuid()}).strict(),
 get_database_schema:z.object({}).strict(),list_database_tables:z.object({}).strict(),
 read_database_records:z.object({table:z.enum(tables),limit,offset}).strict(),
 database_backup:z.object({table:z.enum(tables),limit,offset}).strict(),
 run_safe_migration:z.object({id:z.string().regex(/^[a-z0-9_-]{1,80}$/),table:z.enum(tables),column:z.string().regex(/^ext_[a-z][a-z0-9_]{0,40}$/),type:z.enum(['TEXT','INTEGER','REAL'])}).strict(),
 create_preview_deployment:z.object({branch,sha}).strict(),publish_approved_version:z.object({sha}).strict(),
 get_deployment_status:z.object({runId:z.number().int().positive()}).strict(),rollback_deployment:z.object({sha}).strict(),
 get_audit_logs:z.object({limit,offset}).strict(),get_operation_status:z.object({requestId:z.string().uuid()}).strict(),
};
export type ExtensionName=keyof typeof extensionSchemas;
export const descriptions:Record<ExtensionName,string>={
 list_build_runs:'Lista execuções recentes e seus runIds; filtro opcional por SHA.',get_repository_status:'Consulta repositório, branch principal e conexão GitHub.',list_source_files:'Lista arquivos do código no GitHub.',read_source_file:'Lê arquivo UTF-8 do projeto pelo GitHub.',
 write_source_file:'Edita arquivo em branch mcp/ com verificação do SHA atual.',create_source_file:'Cria arquivo em branch mcp/.',delete_source_file:'Exclui arquivo após aprovação exata no admin.',create_branch:'Cria branch mcp/ a partir de commit existente.',create_commit:'Cria commit atômico de vários arquivos com comparação do HEAD; exclusões exigem aprovação.',create_pull_request:'Abre PR da branch mcp/ para a principal.',compare_changes:'Compara branch de desenvolvimento com a principal.',
 run_typecheck:'Agenda TypeScript no GitHub Actions para o commit informado.',run_tests:'Agenda testes no GitHub Actions para o commit informado.',run_build:'Agenda build no GitHub Actions para o commit informado.',get_build_logs:'Consulta execução, jobs e etapas; links para logs completos no GitHub.',
 create_backup:'Salva snapshot de páginas, configurações públicas e produtos no banco; não é backup físico completo.',list_versions:'Lista snapshots de conteúdo.',rollback_version:'Restaura snapshot de conteúdo após aprovação no admin.',
 get_database_schema:'Consulta schema das tabelas de negócio autorizadas.',list_database_tables:'Lista tabelas de negócio disponíveis para consulta.',read_database_records:'Lê registros paginados das tabelas de negócio. Não inclui segredos ou credenciais.',database_backup:'Exporta uma página de tabela de negócio com cursor; não é backup físico completo.',run_safe_migration:'Adiciona coluna ext_ opcional em tabela de negócio após aprovação. Não executa SQL livre.',
 create_preview_deployment:'Aciona workflow de preview configurado no admin para SHA exato.',publish_approved_version:'Aciona workflow de produção configurado, após aprovação do SHA exato no admin.',get_deployment_status:'Consulta execução do workflow de publicação; aprovação no GitHub pode ser necessária.',rollback_deployment:'Solicita publicação de commit anterior via workflow configurado e aprovação no admin.',get_audit_logs:'Consulta auditoria paginada sem argumentos ou credenciais.',get_operation_status:'Consulta status de solicitação do próprio administrador.',
};
export function needsApproval(name:string,a:Record<string,any>){return ['save_product','delete_source_file','rollback_version','run_safe_migration','publish_approved_version','rollback_deployment'].includes(name)||(name==='save_page'&&a.page?.status==='published')||(name==='create_commit'&&a.files?.some((f:any)=>f.content===null));}
export const configSchema=z.object({enabled:z.boolean().default(true),disabledTools:z.array(z.string().max(80)).max(100).default([]),repository:z.literal('alexmoretoni/descobridor-site').default('alexmoretoni/descobridor-site'),productionBranch:z.literal('descobridor-site').default('descobridor-site'),checksWorkflow:z.string().regex(/^$|^[a-zA-Z0-9_-]+\.ya?ml$/).default('mcp-checks.yml'),previewWorkflow:z.string().regex(/^$|^[a-zA-Z0-9_-]+\.ya?ml$/).default(''),productionWorkflow:z.string().regex(/^$|^[a-zA-Z0-9_-]+\.ya?ml$/).default('')}).strict();
export const defaultConfig=configSchema.parse({});
