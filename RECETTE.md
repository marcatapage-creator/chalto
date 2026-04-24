# RECETTE — Checklist avant mise en production

> À valider **intégralement** avant chaque `git push origin main`.  
> Tester sur **desktop Chrome** (fenêtre normale) + **mobile Safari ou Chrome** sauf mention contraire.  
> En cas d'échec : ne pas pousser — corriger et recommencer la recette depuis le flux concerné.

---

## 1. Authentification

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 1.1 | Accéder à `/register` et créer un compte email | Redirection vers `/onboarding` puis `/dashboard`. Email de bienvenue reçu. |
| 1.2 | Se déconnecter puis se reconnecter via `/login` | Redirection vers `/dashboard`, session restaurée. |
| 1.3 | Tenter d'accéder à `/dashboard` sans session | Redirection vers `/login`. |
| 1.4 | Connexion Google OAuth (`/api/auth/google`) | Redirection vers `/dashboard`, compte créé ou récupéré. |

---

## 2. Gestion de projet

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 2.1 | Créer un projet via `/projects/new` | Projet visible dans `/projects`, redirection vers la fiche projet. |
| 2.2 | Modifier le nom/phase via `/projects/[id]/edit` | Changements reflétés immédiatement sur la fiche et dans la liste. |
| 2.3 | Changer la phase du projet (conception → chantier → livraison) | Badge de phase mis à jour, aucune erreur console. |

---

## 3. Documents — Flux pro (émission)

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 3.1 | Créer un document dans un projet (via le bouton "+ Document") | Document apparaît avec statut `draft`, upload possible. |
| 3.2 | Uploader un fichier PDF sur le document | Miniature/aperçu visible dans le panneau document. |
| 3.3 | Envoyer le document **au client** (bouton "Envoyer" → "Mon client") | Statut passe à `sent`. Email reçu par le client avec lien de validation. Bouton désactivé côté pro. |
| 3.4 | Envoyer le document **à un prestataire — mode validation** | Statut passe à `sent`. Email reçu par le prestataire. Message du pro visible dans l'espace prestataire. |
| 3.5 | Envoyer le document **à un prestataire — mode transmission** | Même résultat que 3.4, badge "Pour information" dans l'espace prestataire. |
| 3.6 | Vérifier que le commentaire du pro (`pro_message`) apparaît dans l'espace prestataire | Bloc "Message de votre professionnel" visible au-dessus du fichier. |

---

## 4. Documents — Flux client (réception & validation)

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 4.1 | Ouvrir le lien de validation reçu par email (`/validate/[token]`) | Page de validation chargée, aperçu du document visible. |
| 4.2 | Approuver le document | Statut passe à `approved` côté pro (Realtime). Email de notification reçu par le pro. Badge "Approuvé" affiché. |
| 4.3 | Refuser le document avec un commentaire | Statut passe à `rejected` côté pro. Email avec le commentaire reçu. |
| 4.4 | Tenter d'ouvrir un lien de validation expiré ou invalide | Page d'erreur dédiée "Lien invalide" affichée (pas de 404 brut). |

---

## 5. Documents — Flux prestataire (espace collaboration)

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 5.1 | Ouvrir l'espace prestataire via `/invite/[token]` | Espace chargé avec nom du projet, tâches et documents visibles. |
| 5.2 | Token invalide ou expiré | Page d'erreur dédiée "Lien invalide" / "Lien expiré" (pas de 404). |
| 5.3 | Approuver un document en mode **validation** | Statut "Approuvé" affiché. Notification in-app + email envoyé au pro. |
| 5.4 | Refuser un document en mode **validation** avec commentaire | Statut "Refusé" affiché. Notification + email avec commentaire envoyé au pro. |
| 5.5 | Valider la lecture d'un document en mode **transmission** | Bouton "Valider la lecture" disparaît, remplacé par "Lu". Notification + email envoyé au pro. |
| 5.6 | Valider la lecture avec un commentaire optionnel | Email au pro inclut le commentaire. |

---

## 6. Invitations prestataires

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 6.1 | Inviter un prestataire **sans tâche associée** depuis la fiche projet | Email reçu : wording "Votre espace de collaboration est prêt". Lien fonctionnel. |
| 6.2 | Inviter un prestataire **avec tâches** | Email reçu, espace prestataire affiche les tâches. |
| 6.3 | Ré-inviter un prestataire déjà invité | Même lien d'invitation réutilisé (pas de doublon contributor). |
| 6.4 | Inviter un contact **sans email** | Toastr d'erreur "Ce contact n'a pas d'email renseigné" — aucun crash. |

---

## 7. Tâches

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 7.1 | Créer une tâche et l'assigner à un prestataire | Tâche visible dans le board et dans l'espace prestataire. |
| 7.2 | Déplacer une tâche `todo` → `in_progress` → `done` (côté pro) | Colonnes mises à jour en temps réel, aucune erreur. |
| 7.3 | Tâche `done` : vérifier que le bouton "Notifier" est masqué | Seul le bouton "Rouvrir" est visible. |
| 7.4 | Cliquer "Rouvrir" sur une tâche terminée | Tâche repasse en `in_progress`. |
| 7.5 | Mettre à jour le statut d'une tâche **depuis l'espace prestataire** | Changement reflété en temps réel côté pro (Realtime). |
| 7.6 | Prestataire suggère une tâche | Notification côté pro, suggestion visible dans le board. |
| 7.7 | Cliquer "Notifier" sur une tâche `in_progress` | Email/notification de rappel envoyé au prestataire. |

---

## 8. Contacts

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 8.1 | Créer un contact depuis `/contacts` | Contact visible dans la liste. |
| 8.2 | Modifier un contact | Changements persistés. |
| 8.3 | Supprimer un contact | Contact retiré, aucune erreur si lié à un projet. |

---

## 9. Notifications Realtime (desktop Chrome uniquement)

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 9.1 | Ouvrir la fiche projet, faire valider un doc depuis un autre onglet | Statut du document se met à jour **sans rechargement**. |
| 9.2 | Ouvrir la fiche projet, changer le statut d'une tâche depuis l'espace prestataire | Tâche change de colonne sans rechargement. |
| 9.3 | Naviguer entre plusieurs projets rapidement | Aucune erreur "cannot add postgres_changes callbacks after subscribe()" dans la console. |

---

## 10. Rate limiting & sécurité (routes publiques)

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 10.1 | Soumettre le formulaire waitlist 11 fois en moins d'une minute | À partir du 11e appel, réponse HTTP 429 "Trop de requêtes". |
| 10.2 | Vérifier l'absence d'injection HTML dans les emails (nom avec `<script>alert(1)</script>`) | Les chevrons sont échappés dans l'email reçu — aucun script exécuté. |

---

## 11. Paramètres & compte

| # | Action | Résultat attendu |
|---|--------|-----------------|
| 11.1 | Modifier le nom et l'email dans `/settings` | Changements persistés, reflétés dans les emails suivants. |
| 11.2 | Activer le branding custom (logo + nom société) | Logo du pro apparaît dans l'email d'invitation et l'espace prestataire. |
| 11.3 | Désactiver les notifications email | Les prochaines validations n'envoient plus d'email au pro. |

---

## Priorités en cas de temps limité

Si la recette complète n'est pas réalisable, valider **au minimum** ces flux critiques :

1. **3.3** — Envoi document au client + réception email  
2. **4.2** — Approbation client + notification Realtime côté pro  
3. **5.5** — Accusé de lecture transmission + email pro  
4. **6.1** — Invitation prestataire + accès espace  
5. **9.3** — Pas d'erreur Realtime en navigation  

---

*Dernière mise à jour : 2026-04-24*
