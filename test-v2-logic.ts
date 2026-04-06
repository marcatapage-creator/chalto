import { DecisionServiceV2 } from './src/core/logic/v2/DecisionService';
import { DocumentServiceV2 } from './src/core/logic/v2/DocumentService';
import { ReviewServiceV2 } from './src/core/logic/v2/ReviewService';
import { AssignmentServiceV2 } from './src/core/logic/v2/AssignmentService';
import { computeNextActions } from './src/core/logic/v2/NextActionEngine';
import { AuditTrailGeneratorV2 } from './src/core/logic/v2/AuditTrailGenerator';

async function testV2() {
  const docSvc = new DocumentServiceV2();
  const reviewSvc = new ReviewServiceV2();
  const decisionSvc = new DecisionServiceV2();
  const assignSvc = new AssignmentServiceV2();
  const auditGen = new AuditTrailGeneratorV2();

  console.log("--- 🧪 Test Audit-First V2 ---");

  // 1. Thread & Version
  const thread = docSvc.createThread('proj-1', 'Plans de Masse', 'arch-1');
  const v1 = docSvc.addVersion(thread, 's3://bucket/plan-v1.pdf', 'hash-123', 'arch-1');
  console.log("✅ Version 1 Uploadeée");

  // 2. Review Request
  const req1 = reviewSvc.submitForReview(v1, 'proj-1', 'arch-1', 'cli-1');
  console.log("✅ Review Request 1 envoyée");

  // 3. Decision 1 (Reject)
  const dec1 = decisionSvc.createDecision(req1, 'REJECTED', 'CONTRACTUAL', 'cli-1', 'Mauvaise échelle');
  reviewSvc.markAsDecided(req1.id);
  console.log("✅ Décision 1 (Reject) enregistrée");

  // 4. Supersede with Correction (V2)
  const v2 = docSvc.addVersion(thread, 's3://bucket/plan-v2.pdf', 'hash-456', 'arch-1');
  const req2 = reviewSvc.submitForReview(v2, 'proj-1', 'arch-1', 'cli-1');
  const dec2 = decisionSvc.createDecision(req2, 'APPROVED', 'CONTRACTUAL', 'cli-1', 'C est mieux');
  reviewSvc.markAsDecided(req2.id);
  console.log("✅ Décision 2 (Approve) enregistrée");

  // 5. Check NextAction Projection
  const actions = computeNextActions('arch-1', [], [req1, req2], [dec1, dec2]);
  console.log("✅ NextAction Engine Output:", JSON.stringify(actions, null, 2));

  // 6. Check Audit Trail
  const history = auditGen.generateThreadHistory(thread.id, [v1, v2], [req1, req2], [dec1, dec2], []);
  console.log("✅ Audit Trail Count:", history.length);
  
  const truth = auditGen.getContractualTruth(thread.id, [dec1, dec2]);
  console.log("✅ Contractual Truth Outcome:", truth?.outcome);

  if (truth?.outcome === 'APPROVED') {
    console.log("--- 🚀 TEST PASSED ---");
  } else {
    console.log("--- ❌ TEST FAILED ---");
  }
}

testV2();
