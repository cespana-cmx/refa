import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const areaUsers = [
  {
    name: 'Andrea Durán',
    email: 'finanzas@refacil.com',
    password: 'Fin@2024Rf',
    role: Role.USER,
    areaName: 'Finanzas',
  },
  {
    name: 'Leonardo Hurtado',
    email: 'comercial@refacil.com',
    password: 'Com#7891Lh',
    role: Role.USER,
    areaName: 'Comercial',
  },
  {
    name: 'Madelen Pineda',
    email: 'operaciones@refacil.com',
    password: 'Ops$4562Mp',
    role: Role.USER,
    areaName: 'Operaciones',
  },
  {
    name: 'Steven Sanchez',
    email: 'seguridad@refacil.com',
    password: 'Sec!3047Ss',
    role: Role.USER,
    areaName: 'Seguridad de la Información',
  },
  {
    name: 'Paula Guerrero',
    email: 'marketing@refacil.com',
    password: 'Mkt@8163Pg',
    role: Role.USER,
    areaName: 'Marketing',
  },
  {
    name: 'Tatiana Orozco',
    email: 'producto@refacil.com',
    password: 'Prd#5920To',
    role: Role.USER,
    areaName: 'Producto',
  },
  {
    name: 'Juan José Posada',
    email: 'bi@refacil.com',
    password: 'Bi$7348Jp',
    role: Role.USER,
    areaName: 'Inteligencia de Negocios (BI)',
  },
  {
    name: 'Viviana Pérez',
    email: 'tecnologia@refacil.com',
    password: 'Tec!6019Vp',
    role: Role.USER,
    areaName: 'Tecnología',
  },
]

async function main() {
  console.log('🗑️  Limpiando data de pruebas...\n')

  // Delete all non-admin users (cascades to assessments, responses, team members, evaluations, diagnostics)
  const deleted = await prisma.user.deleteMany({ where: { role: Role.USER } })
  console.log(`✓ Eliminados ${deleted.count} usuarios de prueba (y toda su data asociada)`)

  // Confirm assessments are gone
  const remainingAssessments = await prisma.assessment.count()
  const remainingResponses = await prisma.response.count()
  const remainingMembers = await prisma.teamMember.count()
  const remainingDiagnostics = await prisma.leaderDiagnostic.count()
  console.log(`✓ Assessments restantes: ${remainingAssessments}`)
  console.log(`✓ Responses restantes: ${remainingResponses}`)
  console.log(`✓ Team members restantes: ${remainingMembers}`)
  console.log(`✓ Diagnósticos restantes: ${remainingDiagnostics}`)

  console.log('\n👤 Creando usuarios reales...\n')

  for (const userData of areaUsers) {
    const { password, ...rest } = userData
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { ...rest, passwordHash } })
    console.log(`✓ ${user.name.padEnd(20)} | ${user.areaName?.padEnd(35)} | ${user.email}`)
  }

  console.log('\n✅ Seed completado. Usuarios listos para usar.\n')
  console.log('═══════════════════════════════════════════════════════')
  console.log('CREDENCIALES DE ACCESO')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`${'NOMBRE'.padEnd(22)} ${'ÁREA'.padEnd(36)} CONTRASEÑA`)
  console.log('─'.repeat(75))
  for (const u of areaUsers) {
    console.log(`${u.name.padEnd(22)} ${u.areaName!.padEnd(36)} ${u.password}`)
  }
  console.log('═══════════════════════════════════════════════════════')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
