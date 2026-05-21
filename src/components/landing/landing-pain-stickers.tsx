"use client"

import { motion, type Variants } from "framer-motion"

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const sticker: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

export function LandingPainStickers() {
  return (
    <section className="py-20 px-6 md:px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight">Vous reconnaissez ça ?</h2>
          <p className="text-muted-foreground mt-2">
            Des phrases que vous avez déjà dites — ou entendues.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-5 py-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Sticker 1 — Le fichier introuvable */}
          <motion.div
            variants={sticker}
            className="bg-yellow-100 dark:bg-yellow-950/70 shadow-md rounded-sm p-5 cursor-default flex flex-col gap-4 w-full"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-yellow-300 dark:bg-yellow-800 flex items-center justify-center shrink-0">
                <span className="text-yellow-900 dark:text-yellow-100 text-xs font-bold">SB</span>
              </div>
              <div>
                <p className="text-yellow-900 dark:text-yellow-100 text-xs font-semibold leading-none">
                  Sophie B.
                </p>
                <p className="text-yellow-700 dark:text-yellow-400 text-xs leading-none mt-0.5">
                  Cliente
                </p>
              </div>
            </div>
            <p className="text-yellow-900 dark:text-yellow-100 text-base font-semibold leading-snug">
              Tu peux me renvoyer le plan&nbsp;?
              <br />
              J&apos;ai plus le mail.
            </p>
          </motion.div>

          {/* Sticker 3 — La validation fantôme */}
          <motion.div
            variants={sticker}
            className="bg-rose-100 dark:bg-rose-950/70 shadow-md rounded-sm p-5 cursor-default flex flex-col gap-4 w-full"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-rose-300 dark:bg-rose-800 flex items-center justify-center shrink-0">
                <span className="text-rose-900 dark:text-rose-100 text-xs font-bold">MT</span>
              </div>
              <div>
                <p className="text-rose-900 dark:text-rose-100 text-xs font-semibold leading-none">
                  Marc T.
                </p>
                <p className="text-rose-700 dark:text-rose-400 text-xs leading-none mt-0.5">
                  Maître d&apos;ouvrage
                </p>
              </div>
            </div>
            <p className="text-rose-900 dark:text-rose-100 text-base font-semibold leading-snug">
              J&apos;avais pas validé ça,
              <br />
              on en avait parlé mais je n&apos;ai rien signé.
            </p>
          </motion.div>

          {/* Sticker 5 — L'échéance */}
          <motion.div
            variants={sticker}
            className="bg-violet-100 dark:bg-violet-950/70 shadow-md rounded-sm p-5 cursor-default flex flex-col gap-4 w-full"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-300 dark:bg-violet-800 flex items-center justify-center shrink-0">
                <span className="text-violet-900 dark:text-violet-100 text-xs font-bold">PR</span>
              </div>
              <div>
                <p className="text-violet-900 dark:text-violet-100 text-xs font-semibold leading-none">
                  Paul R.
                </p>
                <p className="text-violet-700 dark:text-violet-400 text-xs leading-none mt-0.5">
                  Conducteur de travaux
                </p>
              </div>
            </div>
            <p className="text-violet-900 dark:text-violet-100 text-base font-semibold leading-snug">
              La date de dépôt du PC,
              <br />
              elle était dans quel mail déjà&nbsp;?
            </p>
          </motion.div>

          {/* Sticker 6 — Le fourre-tout */}
          <motion.div
            variants={sticker}
            className="bg-emerald-100 dark:bg-emerald-950/70 shadow-md rounded-sm p-5 cursor-default flex flex-col gap-4 w-full"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-300 dark:bg-emerald-800 flex items-center justify-center shrink-0">
                <span className="text-emerald-900 dark:text-emerald-100 text-xs font-bold">JM</span>
              </div>
              <div>
                <p className="text-emerald-900 dark:text-emerald-100 text-xs font-semibold leading-none">
                  Julie M.
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 text-xs leading-none mt-0.5">
                  Architecte
                </p>
              </div>
            </div>
            <p className="text-emerald-900 dark:text-emerald-100 text-base font-semibold leading-snug">
              Quelque part dans les mails,
              <br />
              l&apos;Excel, le carnet. Pas au bon endroit.
            </p>
          </motion.div>
        </motion.div>

        {/* Transition */}
        <div className="mt-16 text-center space-y-3">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Ces problèmes ont une seule cause : l&apos;information est éparpillée entre des outils
            qui ne se parlent pas.
          </p>
          <p className="text-lg md:text-xl font-semibold text-foreground">
            Chalto centralise tout.
          </p>
        </div>
      </div>
    </section>
  )
}
