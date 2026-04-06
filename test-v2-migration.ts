import { migrateProjectV1ToV2 } from './src/core/logic/v2/migration';
import { Project, Document } from './src/core/types';

const MOCK_PROJECT: Project = {
  id: 'prj-123',
  name: 'Rénovation Loft Bastille',
  type: 'RENOVATION',
  clientName: 'Marc-Antoine Dupont',
  clientId: 'cli-1',
  address: 'Paris',
  status: 'STUDY',
  createdBy: 'arch-1',
  members: [],
  phases: [],
  statusChangedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    name: 'Plan de Masse',
    url: '/uploads/plan.pdf',
    versionNumber: 1,
    isLatest: true,
    status: 'APPROVED',
    visibility: ['ARCHITECT', 'CLIENT'],
    uploadedBy: 'Sophie Archi',
    uploadedAt: '2026-04-01T10:00:00Z',
    stage: 'STUDY',
  },
  {
    id: 'doc-2',
    name: 'Esquisse V2',
    url: '/uploads/v2.pdf',
    versionNumber: 2,
    isLatest: true,
    status: 'PENDING',
    visibility: ['ARCHITECT', 'CLIENT'],
    uploadedBy: undefined as any, // Anomaly test
    uploadedAt: '2026-04-04T15:30:00Z',
    stage: 'STUDY',
  }
];

async function testV2Migration() {
  console.log("--- 🧪 Test Logic V2 - Migration Interprétative ---");

  const result = migrateProjectV1ToV2(MOCK_PROJECT, MOCK_DOCUMENTS);

  console.log("✅ Threads créés :", result.threads.length);
  console.log("✅ Versions créées :", result.versions.length);
  console.log("✅ Intentions (ReviewRequests) :", result.requests.length);
  console.log("✅ Décisions inférées :", result.decisions.length);

  // Verification 1: Approved document became a decision
  const approvedDoc = result.threads.find(t => t.title === 'Plan de Masse');
  const associatedRequest = result.requests.find(r => r.versionId === `ver-doc-1-initial`);
  const associatedDecision = result.decisions.find(d => d.requestId === associatedRequest?.id);
  
  if (associatedDecision && associatedDecision.outcome === 'APPROVED') {
    console.log("🚀 RECONSTITUTION DÉCISION OK");
  }

  // Verification 2: Anomaly Report
  console.log("✅ Rapport d'Ambiguïtés :");
  console.log(JSON.stringify(result.report, null, 2));

  const missingActor = result.report.anomalies.find(a => a.type === 'MISSING_ACTOR');
  if (missingActor) {
    console.log("🚀 DÉTECTION ANOMALIE OK (Missing Actor)");
  }

  if (result.report.totalConverted === 2 && result.report.inferredDecisions === 1) {
    console.log("--- 🚀 TOUS LES TESTS DE MIGRATION PASSENT ---");
  } else {
    console.log("--- ❌ ÉCHEC DES TESTS ---");
  }
}

testV2Migration();
