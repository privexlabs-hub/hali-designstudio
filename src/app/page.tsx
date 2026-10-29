import Link from 'next/link';
import { Icon } from '@/components/ds';
import { StudioHeader } from '@/components/shell/StudioHeader';
import { ROUTES } from '@/lib/nav';
import s from './hub.module.css';

const TOOLS: [string, string, string, string][] = [
  [ROUTES.editor, 'Template editor', 'Social, carousel, article, banner, ad, avatar, email and web templates. Edit, resize and export PNG, JPEG, SVG or ZIP.', 'pen-tool'],
  [ROUTES.documents, 'Document editor', 'Books and ebooks, reports, whitepapers, proposals, case studies, presentations, articles, newsletters and resumes. Export PDF, DOCX, PPTX, EPUB, HTML, Markdown or PNG.', 'book-text'],
  [ROUTES.playbook, 'Brand identity playbook', 'Logo, colour, type, layout, motif, social and document rules, light and dark, do and don\'t, accessibility and governance.', 'book-open'],
  [ROUTES.designSystem, 'Design system', 'Twelve sections: overview, logo, colour, type, spacing, radius and shadow, motif, voice, components, slides, UI kits, governance. Click any value to copy.', 'swatch-book'],
  [ROUTES.voice, 'Brand voice and knowledge', 'A copy-ready reference for AI tools and content planning, with verified facts separated from items that need confirmation.', 'message-square-text'],
  [ROUTES.assets, 'Asset library', 'Logos, favicons, app icons, social images and template graphics. Download one or a ZIP.', 'folder-open'],
];

const QUICK: [string, string][] = [
  [ROUTES.editor + '#t=social/announcement/ig-portrait', 'Instagram post'],
  [ROUTES.editor + '#new=celebrations', 'Celebration or holiday'],
  ...([['social', 'Social post'], ['carousel', 'Carousel'], ['article', 'Article banner'], ['banners', 'Banner or cover'], ['ads', 'Ad'], ['avatar', 'Avatar'], ['engagement', 'Engagement post'], ['email', 'Email graphic'], ['web', 'Web graphic']] as const)
    .map(([c, label]): [string, string] => [ROUTES.editor + '#new=' + c, label]),
  ...([['book', 'Ebook'], ['report', 'Report'], ['proposal', 'Proposal'], ['presentation', 'Presentation'], ['resume', 'Resume']] as const)
    .map(([t, label]): [string, string] => [ROUTES.documents + '#type=' + t, label]),
];

export default function Hub() {
  return (
    <div className={s.page}>
      <StudioHeader variant="hub" />
      <main className={s.main}>
        <div className={s.intro}>
          <h1 className="st-h1">Hali brand studio</h1>
          <p className="st-lede">The design system, brand reference, assets and template editor for Hali — all reading the same tokens and files.</p>
        </div>
        <div className={s.tools}>
          {TOOLS.map(([href, name, desc, icon]) => (
            <Link key={href} href={href} className={s.tool}>
              <span className={s.toolIcon}><Icon name={icon} size={18} /></span>
              <span className={s.toolText}>
                <span className={s.toolName}>{name}</span>
                <span className={s.toolDesc}>{desc}</span>
              </span>
              <Icon name="arrow-right" size={18} className={s.toolArrow} />
            </Link>
          ))}
        </div>
        <div className={s.quick}>
          <h2 className="st-h4">Start a design</h2>
          <div className="st-pills">
            {QUICK.map(([href, label]) => <Link key={href} href={href} className="st-pill">{label}</Link>)}
          </div>
        </div>
      </main>
    </div>
  );
}
