import { IsoArt, type ArtName } from '@/components/art/ProjectArt'
import { Workshop } from '@/components/home/Workshop'
import { FadeLink } from '@/components/site/PageTransition'
import { BuilderPill, Eyebrow, ProgressBar, StatusBadge, Wrap } from '@/components/ui/bits'
import { PostCard } from '@/components/ui/PostCard'
import { ProjectMedia } from '@/components/ui/ProjectMedia'
import { site } from '@/content/site'
import { getPosts, getProjects } from '@/lib/content'

export const revalidate = 300

const ROOMS: { href: string; art: ArtName; eyebrow: string; title: string; blurb: string }[] = [
  {
    href: '/projects/cheetah',
    art: 'cheetah',
    eyebrow: 'Project · On the bench',
    title: 'Cheetah',
    blurb: 'Our current build, still learning to walk.',
  },
  {
    href: '/projects/cubli',
    art: 'cube',
    eyebrow: 'Project · Finished',
    title: 'Cubli',
    blurb: "A cube that balances on one corner. Here's how we built it.",
  },
  {
    href: '/about',
    art: 'plushies',
    eyebrow: 'Page · About us',
    title: 'About us',
    blurb: "That's the two of us. How we started building together, and who does what.",
  },
  {
    href: '/bench',
    art: 'breadboard',
    eyebrow: 'Page · Our bench',
    title: 'Bench',
    blurb: 'The lab equipment, parts and software behind every build.',
  },
  {
    href: '/notebook',
    art: 'books',
    eyebrow: 'Page · Notebook',
    title: 'Notebook',
    blurb: 'Build logs, things that broke, how we fixed them, and small wins.',
  },
  {
    href: '/say-hi',
    art: 'letter',
    eyebrow: 'Page · Contact',
    title: 'Say hi',
    blurb: 'Questions about a build, an idea, or just hello. We read everything.',
  },
]

export default async function HomePage() {
  const [projects, posts] = await Promise.all([getProjects(), getPosts(3)])
  const featured = projects.filter((p) => p.featured).slice(0, 2)

  return (
    <>
      {/*
        The hero is exactly one screen tall under the header. Wide screens put the intro beside the
        workshop; tall ones stack it above. The workshop drawing scales to whatever space is left.
      */}
      <section className="dots relative flex h-[calc(100svh-var(--header-h))] flex-col overflow-hidden landscape:flex-row">
        <div className="flex flex-none flex-col px-6 pt-6 landscape:w-[min(500px,42%)] landscape:justify-center landscape:py-6 landscape:pr-2 landscape:pl-10">
          <Eyebrow className="mb-3 short:mb-2">SOBJO · The workshop&apos;s open, come on in</Eyebrow>
          <h1 className="hl m-0 text-[clamp(32px,min(13vw,6.5svh),64px)] landscape:text-[clamp(28px,min(5.5vw,8.5svh),76px)]">
            Hi, we&apos;re
            <br />
            <span className="text-gunnar">Gunnar</span> &amp;
            <br />
            <span className="text-ivanna">Ivanna</span>.
          </h1>
          <p className="mt-4 mb-0 text-base leading-[1.55] text-body short:hidden">
            Two engineers who build little robots together on nights and weekends. This is the room where we tinker, and
            every project we&apos;ve made is riding the line.
          </p>
          <div className="mono mt-5 flex flex-wrap items-center gap-3 text-[11px] font-bold short:mt-3">
            <span className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-butter">
              ▸ Grab something off the line
            </span>
            <span className="text-muted">Drop it in the box to go there</span>
          </div>
        </div>
        <div className="relative min-h-0 min-w-0 flex-1">
          <Workshop />
        </div>
      </section>

      <section id="line" className="border-t-[1.5px] border-line bg-white">
        <Wrap className="py-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow className="mb-2.5">What&apos;s on the line</Eyebrow>
              <h2 className="hl m-0 text-[40px] md:text-[52px]">Six things. Six rooms.</h2>
            </div>
            <p className="m-0 max-w-[420px] text-[15px] leading-[1.55] text-body">
              Sort one into the box and it takes you there. Or skip the game and click a card, we won&apos;t tell the
              arm.
            </p>
          </div>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(340px,100%),1fr))]">
            {ROOMS.map((room) => (
              <FadeLink key={room.href} href={room.href} className="card flex items-center gap-4 p-4">
                <IsoArt name={room.art} className="flex-none rounded-md bg-paper" />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="mono text-[10px] text-muted">{room.eyebrow}</span>
                  <span className="hl text-[30px]">{room.title}</span>
                  <span className="text-sm leading-[1.45] text-body">{room.blurb}</span>
                </div>
              </FadeLink>
            ))}
          </div>
        </Wrap>
      </section>

      <section className="dots border-y-[1.5px] border-line">
        <Wrap className="flex flex-wrap items-start gap-10 py-16">
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
            <Eyebrow>Right now</Eyebrow>
            <h2 className="hl m-0 text-[40px] md:text-[52px]">On the bench this month</h2>
            <p className="m-0 text-[15px] leading-[1.6] text-body">{site.rightNow}</p>
            <FadeLink href="/projects" className="btn mt-2 self-start">
              All projects →
            </FadeLink>
          </div>
          <div className="grid min-w-0 flex-[2_1_560px] gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
            {featured.map((project) => (
              <FadeLink
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="card flex flex-col overflow-hidden"
              >
                <ProjectMedia project={project} fallback="label" className="h-[180px]" />
                <div className="flex flex-col gap-2.5 p-[18px]">
                  <div className="mono flex flex-wrap items-center gap-2 text-[10px] text-muted">
                    {project.builders.map((b) => (
                      <BuilderPill key={b} builder={b} />
                    ))}
                    <StatusBadge
                      status={project.status}
                      label={project.status === 'in-progress' ? 'In progress' : undefined}
                      outline
                    />
                  </div>
                  <span className="hl text-[32px]">{project.title}</span>
                  {project.progress ? (
                    <ProgressBar done={project.progress.done} total={project.progress.total} />
                  ) : project.status === 'finished' ? (
                    <div className="flex" role="img" aria-label="Progress: complete">
                      <span className="h-2 flex-1 rounded-sm bg-moss" />
                    </div>
                  ) : null}
                  <span className="ulink">{project.ctaLabel} →</span>
                </div>
              </FadeLink>
            ))}
          </div>
        </Wrap>
      </section>

      <section className="bg-white">
        <Wrap className="py-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow className="mb-2.5">From the notebook</Eyebrow>
              <h2 className="hl m-0 text-[40px] md:text-[52px]">Latest entries</h2>
            </div>
            <FadeLink href="/notebook" className="ulink py-2.5">
              Read the notebook →
            </FadeLink>
          </div>
          {posts.length > 0 ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-body">The first entry is still on the bench.</p>
          )}
        </Wrap>
      </section>
    </>
  )
}
