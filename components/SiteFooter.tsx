/**
 * 全局极简底栏，fixed 在视口底部、永远可见。
 * 高度 ~32px（py-1.5），半透明 + 模糊背景，z-30（低于 fumadocs sidebar collapse trigger 的 z-40）。
 *
 * 配合 root layout 的 body padding-bottom，避免遮挡内容。
 */
export function SiteFooter() {
  return (
    <footer
      className="
        fixed bottom-0 left-0 right-0 z-30
        border-t border-fd-border/60
        bg-[#0b0c10]/70 backdrop-blur-md backdrop-saturate-150
      "
    >
      <div
        className="
          mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5
          text-[11px] text-fd-muted-foreground
        "
      >
        <div className="hidden truncate sm:block">
          © 2024 - 2026 上海佰云汇梦软件科技有限公司
        </div>
        <div className="flex w-full items-center justify-center gap-x-3 gap-y-1 sm:w-auto sm:justify-end">
          <a
            href="https://beian.miit.gov.cn/#/Integrated/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fd-foreground transition-colors"
          >
            沪ICP备2024096261号-4
          </a>
          <span className="text-fd-border" aria-hidden>
            ·
          </span>
          <a
            href="https://arcartx.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fd-foreground transition-colors"
          >
            官方社区
          </a>
        </div>
      </div>
    </footer>
  );
}
