import { flushSync } from 'react-dom';

/** 
 * 缓动曲线与持续时间配置：
 * - 缓动曲线：推荐使用平滑曲线（如标准 ease-in-out），避免初始爆发速度过快
 * - 持续时间：700ms~800ms 扩散感更加柔和清晰（此前 450ms 偏快）
 */
export const REVEAL_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const REVEAL_DURATION = 600;

let activeTransition: ViewTransition | null = null;

export interface ThemeTransitionOptions {
  element?: HTMLElement | null;
  nextResolved?: string;
  resolvedTheme?: string;
  apply: () => void;
  reduceMotion?: boolean;
}

/**
 * 以触发元素为中心，使用 View Transitions API + WAAPI 实现全屏圆形水波纹扩散动效。
 * 兼容降级：若浏览器不支持或用户开启减少动态，则降级为普通切换或默认淡入淡出。
 */
export function triggerThemeTransition({
  element,
  nextResolved,
  resolvedTheme,
  apply,
  reduceMotion = false,
}: ThemeTransitionOptions) {
  // 外观不变（如 dark → 跟随系统且系统为深色）或不支持 ViewTransition：直接同步切换，不做过渡
  if (
    (nextResolved && nextResolved === resolvedTheme) ||
    typeof document === 'undefined' ||
    !document.startViewTransition
  ) {
    apply();
    return;
  }

  // 减少动态：保留浏览器默认的淡入淡出，去掉圆形扩散
  if (reduceMotion) {
    document.startViewTransition(() => flushSync(apply));
    return;
  }

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  if (element) {
    const { left, top, width, height } = element.getBoundingClientRect();
    x = left + width / 2;
    y = top + height / 2;
  }

  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const root = document.documentElement;
  root.dataset.themeReveal = '';

  // flushSync 让 next-themes 在快照前同步写入 <html> 的 class，
  // 否则新旧快照相同，过渡退化为瞬切
  const transition = document.startViewTransition(() => {
    flushSync(apply);
  });
  activeTransition = transition;

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: REVEAL_DURATION,
          easing: REVEAL_EASING,
          pseudoElement: '::view-transition-new(root)',
        }
      );
    })
    .catch(() => {});

  transition.finished.finally(() => {
    // 连续点击时旧过渡会被中断，只由最后一次负责清理
    if (activeTransition === transition) {
      delete root.dataset.themeReveal;
      activeTransition = null;
    }
  });
}
