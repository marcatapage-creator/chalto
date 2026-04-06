import { DocumentServiceV2 } from './src/core/logic/v2/DocumentService';
import { ReviewServiceV2 } from './src/core/logic/v2/ReviewService';
import { DecisionServiceV2 } from './src/core/logic/v2/DecisionService';
import { SubmitDocumentVersionCommand } from './src/core/commands/v2/document-commands';
import { RecordDecisionCommand } from './src/core/commands/v2/decision-commands';

async function testV2Commands() {
  const docSvc = new DocumentServiceV2();
  const reviewSvc = new ReviewServiceV2();
  const decisionSvc = new DecisionServiceV2();

  console.log("--- 🧪 Test Logic V2 - Infrastructure de Commandes ---");

  // 0. Setup Initial Thread
  const thread = docSvc.createThread('prj-1', 'Plan d\'exécution', 'arch-1');

  // 1. Double Submit (Idempotency Test)
  const cmdSubmit: SubmitDocumentVersionCommand = {
    meta: {
      commandId: 'cmd-sub-1',
      actorId: 'arch-1',
      issuedAt: new Date().toISOString(),
      source: 'UI',
      idempotencyKey: 'idem-1'
    },
    threadId: thread.id,
    storageKey: 's3://path/v1.pdf',
    fileHash: 'sha-123'
  };

  console.log("👉 Tentative 1: Submit Version");
  const res1 = docSvc.executeSubmitVersion(cmdSubmit, thread.id);
  console.log("✅ Résultat 1:", res1.ok ? "OK" : "Error: " + res1.error);
  console.log("✅ Events :", res1.emittedEvents.length);

  console.log("👉 Tentative 2 (Même CommandId): Submit Version");
  const res2 = docSvc.executeSubmitVersion(cmdSubmit, thread.id);
  console.log("✅ Résultat 2:", res2.ok ? "OK" : "Error: " + res2.error);
  if (res2.error === 'IDEMPOTENCY_CONFLICT') {
    console.log("🚀 IDEMPOTENCE OK");
  }

  // 2. Flow Decision
  const version = res1.entity!;
  const resReview = reviewSvc.executeRequestReview({
    meta: { commandId: 'cmd-req-1', actorId: 'arch-1', issuedAt: new Date().toISOString(), source: 'UI' },
    versionId: version.id,
    projectId: 'prj-1',
    requestedTo: 'cli-1'
  }, version);

  const request = resReview.entity!;
  const cmdDecide: RecordDecisionCommand = {
    meta: { commandId: 'cmd-dec-1', actorId: 'cli-1', issuedAt: new Date().toISOString(), source: 'UI' },
    requestId: request.id,
    outcome: 'APPROVED',
    authority: 'CONTRACTUAL'
  };

  console.log("👉 Tentative 1: Record Decision");
  const resDec1 = decisionSvc.executeRecordDecision(cmdDecide, request);
  console.log("✅ Résultat Décision:", resDec1.ok ? "OK" : "Error: " + resDec1.error);
  
  // Simulation : Marquer comme décidé
  reviewSvc.markAsDecided(request.id);

  console.log("👉 Tentative 2: Record Decision (sur requête déjà décidée)");
  const resDec2 = decisionSvc.executeRecordDecision({
    ...cmdDecide,
    meta: { ...cmdDecide.meta, commandId: 'cmd-dec-2' } // Nouveau commandId
  }, request);
  
  console.log("✅ Résultat Décision 2:", resDec2.ok ? "OK" : "Error: " + resDec2.error);
  if (resDec2.error === 'REVIEW_REQUEST_ALREADY_DECIDED') {
    console.log("🚀 BUSINESS RULES OK (Already Decided)");
  }

  if (resDec1.ok && resDec2.error === 'REVIEW_REQUEST_ALREADY_DECIDED') {
    console.log("--- 🚀 TOUS LES TESTS DE COMMANDE PASSENT ---");
  } else {
    console.log("--- ❌ ÉCHEC DES TESTS ---");
  }
}

testV2Commands();
