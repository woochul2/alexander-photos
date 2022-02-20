import isMobile from 'ismobilejs';

export default {
  DELAY: 500,

  /**
   * 툴팁의 내용과 위치를 설정한다.
   *
   * @param {HTMLElement} element
   * @param {string} title
   */
  setTooltip(element, title) {
    this.tooltip.innerHTML = title;

    const rect = element.getBoundingClientRect();
    const { top, left, height, width } = rect;
    this.tooltip.style.top = `${top + height}px`;
    this.tooltip.style.left = `${left + width / 2}px`;

    window.requestAnimationFrame(() => {
      this.tooltip.classList.remove('visible');

      window.requestAnimationFrame(() => {
        this.tooltip.classList.add('visible');
      });
    });

    this.currentElement = element;
  },

  /**
   * 툴팁 엘리먼트를 body에 추가한다.
   *
   * @param {HTMLElement} element
   * @param {title} string
   */
  show(element, title) {
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'tooltip';
    this.setTooltip(element, title);

    const tooltipMouseEnterListener = () => {
      clearTimeout(this.removeTimeoutID);
    };
    const tooltipMouseLeaveListener = () => {
      this.removeTimeoutID = setTimeout(() => {
        this.remove();
      }, this.DELAY);
    };
    this.tooltip.addEventListener('mouseenter', tooltipMouseEnterListener);
    this.tooltip.addEventListener('mouseleave', tooltipMouseLeaveListener);

    document.body.appendChild(this.tooltip);
  },

  /**
   * 툴팁을 삭제한다.
   */
  remove() {
    if (!this.tooltip) return;

    this.tooltip.remove();
    delete this.tooltip;
    delete this.currentElement;
  },

  /**
   * 엘리먼트에 툴팁 이벤트 리스너를 추가한다.
   *
   * @param {HTMLElement} element
   * @param {string} title
   */
  add(element, title) {
    if (isMobile().any) return;
    if (!element) return;

    const enterListener = () => {
      clearTimeout(this.removeTimeoutID);

      if (this.currentElement && this.currentElement !== element) {
        this.setTooltip(element, title);
        return;
      }

      if (this.tooltip) return;

      this.showTimeoutID = setTimeout(() => {
        this.show(element, title);
      }, this.DELAY);
    };

    const leaveListener = () => {
      if (!this.tooltip) {
        clearTimeout(this.showTimeoutID);
        return;
      }

      this.removeTimeoutID = setTimeout(() => {
        this.remove();
      }, this.DELAY);
    };

    const clickListener = () => {
      if (!this.tooltip) {
        clearTimeout(this.showTimeoutID);
      } else {
        this.remove();
      }
    };

    element.addEventListener('mouseenter', enterListener);
    element.addEventListener('mouseleave', leaveListener);
    element.addEventListener('click', clickListener);
  },
};
