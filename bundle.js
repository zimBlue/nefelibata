(function() {
    function $() {
        return Array.prototype.slice.call(document.querySelectorAll.apply(document, arguments));
    }

    // copy widgets in the right column, when exist, to the bottom of the left column
    if ($('.columns .column-right').length && $('.columns .column-right-shadow').length && !$('.columns .column-right-shadow')[0].children.length) {
        for (const child of $('.columns .column-right')[0].children) {
            $('.columns .column-right-shadow')[0].append(child.cloneNode(true));
        }
    }
}());
;
(function() {
    function $() {
        return Array.prototype.slice.call(document.querySelectorAll.apply(document, arguments));
    }

    $('body > .navbar, body > .section, body > .footer').forEach(element => {
        element.style.transition = '0s';
        element.style.opacity = '0';
    });
    document.querySelector('body > .navbar').style.transform = 'translateY(-100px)';
    [
        '.column-main > .card, .column-main > .pagination, .column-main > .post-navigation',
        '.column-left > .card, .column-right-shadow > .card',
        '.column-right > .card'
    ].forEach(selector => {
        $(selector).forEach(element => {
            element.style.transition = '0s';
            element.style.opacity = '0';
            element.style.transform = 'scale(0.8)';
            element.style.transformOrigin = 'center top';
        });
    });
    // disable jump to location.hash
    if (window.location.hash) {
        window.scrollTo(0, 0);
        setTimeout(() => window.scrollTo(0, 0));
    }

    setTimeout(() => {
        $('body > .navbar, body > .section, body > .footer').forEach(element => {
            element.style.opacity = '1';
            element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        });
        document.querySelector('body > .navbar').style.transform = 'translateY(0)';

        let i = 1;
        [
            '.column-main > .card, .column-main > .pagination, .column-main > .post-navigation',
            '.column-left > .card, .column-right-shadow > .card',
            '.column-right > .card'
        ].forEach(selector => {
            $(selector).forEach(element => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = '';
                    element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                }, i * 100);
                i++;
            });
        });

        // jump to location.hash
        if (window.location.hash) {
            setTimeout(() => {
                const id = '#' + CSS.escape(window.location.hash.substring(1));
                const target = document.querySelector(id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }, i * 100);
        }
    });
}());
;
$(document).ready(() => {
    const $button = $('#back-to-top');
    const $footer = $('footer.footer');
    const $mainColumn = $('.column-main');
    const $leftSidebar = $('.column-left');
    const $rightSidebar = $('.column-right');
    let lastScrollTop = 0;
    const rightMargin = 20;
    const bottomMargin = 20;
    let lastState = null;
    const state = {
        base: {
            classname: 'card has-text-centered',
            left: '',
            width: 64,
            bottom: bottomMargin
        }
    };
    state['desktop-hidden'] = Object.assign({}, state.base, {
        classname: state.base.classname + ' rise-up'
    });
    state['desktop-visible'] = Object.assign({}, state['desktop-hidden'], {
        classname: state['desktop-hidden'].classname + ' fade-in'
    });
    state['desktop-dock'] = Object.assign({}, state['desktop-visible'], {
        classname: state['desktop-visible'].classname + ' fade-in is-rounded',
        width: 40
    });
    state['mobile-hidden'] = Object.assign({}, state.base, {
        classname: state.base.classname + ' fade-in',
        right: rightMargin
    });
    state['mobile-visible'] = Object.assign({}, state['mobile-hidden'], {
        classname: state['mobile-hidden'].classname + ' rise-up'
    });

    function isStateEquals(prev, next) {
        return ![].concat(Object.keys(prev), Object.keys(next)).some(key => {
            return !Object.prototype.hasOwnProperty.call(prev, key)
                || !Object.prototype.hasOwnProperty.call(next, key)
                || next[key] !== prev[key];
        });
    }

    function applyState(state) {
        if (lastState !== null && isStateEquals(lastState, state)) {
            return;
        }
        $button.attr('class', state.classname);
        for (const prop in state) {
            if (prop === 'classname') {
                continue;
            }
            $button.css(prop, state[prop]);
        }
        lastState = state;
    }

    function isDesktop() {
        return window.innerWidth >= 1078;
    }

    function isTablet() {
        return window.innerWidth >= 768 && !isDesktop();
    }

    function isScrollUp() {
        return $(window).scrollTop() < lastScrollTop && $(window).scrollTop() > 0;
    }

    function hasLeftSidebar() {
        return $leftSidebar.length > 0;
    }

    function hasRightSidebar() {
        return $rightSidebar.length > 0;
    }

    function getRightSidebarBottom() {
        if (!hasRightSidebar()) {
            return 0;
        }
        return Math.max.apply(null, $rightSidebar.find('.widget').map(function() {
            return $(this).offset().top + $(this).outerHeight(true);
        }));
    }

    function getScrollTop() {
        return $(window).scrollTop();
    }

    function getScrollBottom() {
        return $(window).scrollTop() + $(window).height();
    }

    function getButtonWidth() {
        return $button.outerWidth(true);
    }

    function getButtonHeight() {
        return $button.outerHeight(true);
    }

    function updateScrollTop() {
        lastScrollTop = $(window).scrollTop();
    }

    function update() {
        // desktop mode or tablet mode with only right sidebar enabled
        if (isDesktop() || (isTablet() && !hasLeftSidebar() && hasRightSidebar())) {
            let nextState;
            const padding = ($mainColumn.outerWidth() - $mainColumn.width()) / 2;
            const maxLeft = $(window).width() - getButtonWidth() - rightMargin;
            const maxBottom = $footer.offset().top + (getButtonHeight() / 2) + bottomMargin;
            if (getScrollTop() === 0 || getScrollBottom() < getRightSidebarBottom() + padding + getButtonHeight()) {
                nextState = state['desktop-hidden'];
            } else if (getScrollBottom() < maxBottom) {
                nextState = state['desktop-visible'];
            } else {
                nextState = Object.assign({}, state['desktop-dock'], {
                    bottom: getScrollBottom() - maxBottom + bottomMargin
                });
            }

            const left = $mainColumn.offset().left + $mainColumn.outerWidth() + padding;
            nextState = Object.assign({}, nextState, {
                left: Math.min(left, maxLeft)
            });
            applyState(nextState);
        } else {
            // mobile and tablet mode
            if (!isScrollUp()) {
                applyState(state['mobile-hidden']);
            } else {
                applyState(state['mobile-visible']);
            }
            updateScrollTop();
        }
    }

    update();
    $(window).resize(update);
    $(window).scroll(update);

    $('#back-to-top').on('click', () => {
        if (CSS && CSS.supports && CSS.supports('(scroll-behavior: smooth)')) {
            window.scroll({ top: 0, behavior: 'smooth' });
        } else {
            $('body, html').animate({ scrollTop: 0 }, 400);
        }
    });
});
;
(function() {
    // eslint-disable-next-line no-unused-vars
    let pjax;

    function initPjax() {
        try {
            const Pjax = window.Pjax || function() {};
            pjax = new Pjax({
                selectors: [
                    'head title',
                    '.columns',
                    '.navbar-start',
                    '.navbar-end',
                    '.searchbox',
                    '#back-to-top',
                    '[data-pjax]',
                    '.pjax-reload'
                ]
            });
        } catch (e) {
            console.warn('PJAX error: ' + e);
        }
    }

    // // Listen for start of Pjax
    // document.addEventListener('pjax:send', function() {
    //     return;
    //     // TODO pace start loading animation
    // })

    // // Listen for completion of Pjax
    // document.addEventListener('pjax:complete', function() {
    //     return;
    //     // TODO pace stop loading animation
    // })

    document.addEventListener('DOMContentLoaded', () => initPjax());
}());
;
/* eslint-disable node/no-unsupported-features/node-builtins */
(function($, moment, ClipboardJS, config) {
    $('.article img:not(".not-gallery-item")').each(function() {
        // wrap images with link and add caption if possible
        if ($(this).parent('a').length === 0) {
            $(this).wrap('<a class="gallery-item" href="' + $(this).attr('src') + '"></a>');
            if (this.alt) {
                $(this).after('<p class="has-text-centered is-size-6 caption">' + this.alt + '</p>');
            }
        }
    });

    if (typeof $.fn.lightGallery === 'function') {
        $('.article').lightGallery({ selector: '.gallery-item' });
    }
    if (typeof $.fn.justifiedGallery === 'function') {
        if ($('.justified-gallery > p > .gallery-item').length) {
            $('.justified-gallery > p > .gallery-item').unwrap();
        }
        $('.justified-gallery').justifiedGallery();
    }

    if (typeof moment === 'function') {
        $('.article-meta time').each(function() {
            $(this).text(moment($(this).attr('datetime')).fromNow());
        });
    }

    $('.article > .content > table').each(function() {
        if ($(this).width() > $(this).parent().width()) {
            $(this).wrap('<div class="table-overflow"></div>');
        }
    });

    function adjustNavbar() {
        const navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
        if ($(document).outerWidth() < navbarWidth) {
            $('.navbar-main .navbar-menu').addClass('justify-content-start');
        } else {
            $('.navbar-main .navbar-menu').removeClass('justify-content-start');
        }
    }
    adjustNavbar();
    $(window).resize(adjustNavbar);

    function toggleFold(codeBlock, isFolded) {
        const $toggle = $(codeBlock).find('.fold i');
        !isFolded ? $(codeBlock).removeClass('folded') : $(codeBlock).addClass('folded');
        !isFolded ? $toggle.removeClass('fa-angle-right') : $toggle.removeClass('fa-angle-down');
        !isFolded ? $toggle.addClass('fa-angle-down') : $toggle.addClass('fa-angle-right');
    }

    function createFoldButton(fold) {
        return '<span class="fold">' + (fold === 'unfolded' ? '<i class="fas fa-angle-down"></i>' : '<i class="fas fa-angle-right"></i>') + '</span>';
    }

    $('figure.highlight table').wrap('<div class="highlight-body">');
    if (typeof config !== 'undefined'
        && typeof config.article !== 'undefined'
        && typeof config.article.highlight !== 'undefined') {

        $('figure.highlight').addClass('hljs');
        $('figure.highlight .code .line span').each(function() {
            const classes = $(this).attr('class').split(/\s+/);
            for (const cls of classes) {
                $(this).addClass('hljs-' + cls);
                $(this).removeClass(cls);
            }
        });


        const clipboard = config.article.highlight.clipboard;
        const fold = config.article.highlight.fold.trim();

        $('figure.highlight').each(function() {
            if ($(this).find('figcaption').length) {
                $(this).find('figcaption').addClass('level is-mobile');
                $(this).find('figcaption').append('<div class="level-left">');
                $(this).find('figcaption').append('<div class="level-right">');
                $(this).find('figcaption div.level-left').append($(this).find('figcaption').find('span'));
                $(this).find('figcaption div.level-right').append($(this).find('figcaption').find('a'));
            } else {
                if (clipboard || fold) {
                    $(this).prepend('<figcaption class="level is-mobile"><div class="level-left"></div><div class="level-right"></div></figcaption>');
                }
            }
        });

        if (typeof ClipboardJS !== 'undefined' && clipboard) {
            $('figure.highlight').each(function() {
                const id = 'code-' + Date.now() + (Math.random() * 1000 | 0);
                const button = '<a href="javascript:;" class="copy" title="Copy" data-clipboard-target="#' + id + ' .code"><i class="fas fa-copy"></i></a>';
                $(this).attr('id', id);
                $(this).find('figcaption div.level-right').append(button);
            });
            new ClipboardJS('.highlight .copy'); // eslint-disable-line no-new
        }

        if (fold) {
            $('figure.highlight').each(function() {
                $(this).addClass('foldable'); // add 'foldable' class as long as fold is enabled

                if ($(this).find('figcaption').find('span').length > 0) {
                    const span = $(this).find('figcaption').find('span');
                    if (span[0].innerText.indexOf('>folded') > -1) {
                        span[0].innerText = span[0].innerText.replace('>folded', '');
                        $(this).find('figcaption div.level-left').prepend(createFoldButton('folded'));
                        toggleFold(this, true);
                        return;
                    }
                }
                $(this).find('figcaption div.level-left').prepend(createFoldButton(fold));
                toggleFold(this, fold === 'folded');
            });

            $('figure.highlight figcaption .level-left').click(function() {
                const $code = $(this).closest('figure.highlight');
                toggleFold($code.eq(0), !$code.hasClass('folded'));
            });
        }
    }

    const $toc = $('#toc');
    if ($toc.length > 0) {
        const $mask = $('<div>');
        $mask.attr('id', 'toc-mask');

        $('body').append($mask);

        function toggleToc() { // eslint-disable-line no-inner-declarations
            $toc.toggleClass('is-active');
            $mask.toggleClass('is-active');
        }

        $toc.on('click', toggleToc);
        $mask.on('click', toggleToc);
        $('.navbar-main .catalogue').on('click', toggleToc);
    }
}(jQuery, window.moment, window.ClipboardJS, window.IcarusThemeSettings));
;
/**
 * Insight search plugin
 * @author PPOffice { @link https://github.com/ppoffice }
 */
// eslint-disable-next-line no-unused-vars
function loadInsight(config, translation) {
  const $main = $('.searchbox');
  const $input = $main.find('.searchbox-input');
  const $container = $main.find('.searchbox-body');

  function section(title) {
    return $('<section>').addClass('searchbox-result-section').append($('<header>').text(title));
  }

  function merge(ranges) {
    let last;
    const result = [];

    ranges.forEach((r) => {
      if (!last || r[0] > last[1]) {
        result.push((last = r));
      } else if (r[1] > last[1]) {
        last[1] = r[1];
      }
    });

    return result;
  }

  function findAndHighlight(text, matches, maxlen) {
    if (!Array.isArray(matches) || !matches.length || !text) {
      return maxlen ? text.slice(0, maxlen) : text;
    }
    const testText = text.toLowerCase();
    const indices = matches
      .map((match) => {
        const index = testText.indexOf(match.toLowerCase());
        if (!match || index === -1) {
          return null;
        }
        return [index, index + match.length];
      })
      .filter((match) => {
        return match !== null;
      })
      .sort((a, b) => {
        return a[0] - b[0] || a[1] - b[1];
      });

    if (!indices.length) {
      return text;
    }

    let result = '';
    let last = 0;
    const ranges = merge(indices);
    const sumRange = [ranges[0][0], ranges[ranges.length - 1][1]];
    if (maxlen && maxlen < sumRange[1]) {
      last = sumRange[0];
    }

    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      result += text.slice(last, Math.min(range[0], sumRange[0] + maxlen));
      if (maxlen && range[0] >= sumRange[0] + maxlen) {
        break;
      }
      result += '<em>' + text.slice(range[0], range[1]) + '</em>';
      last = range[1];
      if (i === ranges.length - 1) {
        if (maxlen) {
          result += text.slice(range[1], Math.min(text.length, sumRange[0] + maxlen + 1));
        } else {
          result += text.slice(range[1]);
        }
      }
    }

    return result;
  }

  function searchItem(icon, title, slug, preview, url) {
    title = title != null && title !== '' ? title : translation.untitled;
    const subtitle = slug
      ? '<span class="searchbox-result-title-secondary">(' + slug + ')</span>'
      : '';

    return `<a class="searchbox-result-item" href="${url}">
            <span class="searchbox-result-icon">
                <i class="fa fa-${icon}" />
            </span>
            <span class="searchbox-result-content">
                <span class="searchbox-result-title">
                    ${title}
                    ${subtitle}
                </span>
                ${preview ? '<span class="searchbox-result-preview">' + preview + '</span>' : ''}
            </span>
        </a>`;
  }

  function sectionFactory(keywords, type, array) {
    let $searchItems;
    if (array.length === 0) return null;
    const sectionTitle = translation[type.toLowerCase()];
    switch (type) {
      case 'POSTS':
      case 'PAGES':
        $searchItems = array.map((item) => {
          const title = findAndHighlight(item.title, keywords);
          const text = findAndHighlight(item.text, keywords, 100);
          return searchItem('file', title, null, text, item.link);
        });
        break;
      case 'CATEGORIES':
      case 'TAGS':
        $searchItems = array.map((item) => {
          const name = findAndHighlight(item.name, keywords);
          const slug = findAndHighlight(item.slug, keywords);
          return searchItem(type === 'CATEGORIES' ? 'folder' : 'tag', name, slug, null, item.link);
        });
        break;
      default:
        return null;
    }
    return section(sectionTitle).append($searchItems);
  }

  function parseKeywords(keywords) {
    return keywords
      .split(' ')
      .filter((keyword) => {
        return !!keyword;
      })
      .map((keyword) => {
        return keyword.toLowerCase();
      });
  }

  /**
   * Judge if a given post/page/category/tag contains all of the keywords.
   * @param Object            obj     Object to be weighted
   * @param Array<String>     fields  Object's fields to find matches
   */
  function filter(keywords, obj, fields) {
    const keywordArray = parseKeywords(keywords);
    const containKeywords = keywordArray.filter((keyword) => {
      const containFields = fields.filter((field) => {
        if (!Object.prototype.hasOwnProperty.call(obj, field)) {
          return false;
        }
        if (obj[field].toLowerCase().indexOf(keyword) > -1) {
          return true;
        }
        return false;
      });
      if (containFields.length > 0) {
        return true;
      }
      return false;
    });
    return containKeywords.length === keywordArray.length;
  }

  function filterFactory(keywords) {
    return {
      post: function (obj) {
        return filter(keywords, obj, ['title', 'text']);
      },
      page: function (obj) {
        return filter(keywords, obj, ['title', 'text']);
      },
      category: function (obj) {
        return filter(keywords, obj, ['name', 'slug']);
      },
      tag: function (obj) {
        return filter(keywords, obj, ['name', 'slug']);
      },
    };
  }

  /**
   * Calculate the weight of a matched post/page/category/tag.
   * @param Object            obj     Object to be weighted
   * @param Array<String>     fields  Object's fields to find matches
   * @param Array<Integer>    weights Weight of every field
   */
  function weight(keywords, obj, fields, weights) {
    let value = 0;
    parseKeywords(keywords).forEach((keyword) => {
      const pattern = new RegExp(keyword, 'img'); // Global, Multi-line, Case-insensitive
      fields.forEach((field, index) => {
        if (Object.prototype.hasOwnProperty.call(obj, field)) {
          const matches = obj[field].match(pattern);
          value += matches ? matches.length * weights[index] : 0;
        }
      });
    });
    return value;
  }

  function weightFactory(keywords) {
    return {
      post: function (obj) {
        return weight(keywords, obj, ['title', 'text'], [3, 1]);
      },
      page: function (obj) {
        return weight(keywords, obj, ['title', 'text'], [3, 1]);
      },
      category: function (obj) {
        return weight(keywords, obj, ['name', 'slug'], [1, 1]);
      },
      tag: function (obj) {
        return weight(keywords, obj, ['name', 'slug'], [1, 1]);
      },
    };
  }

  function search(json, keywords) {
    const weights = weightFactory(keywords);
    const filters = filterFactory(keywords);
    const posts = json.posts;
    const pages = json.pages;
    const tags = json.tags;
    const categories = json.categories;
    return {
      posts: posts
        .filter(filters.post)
        .sort((a, b) => {
          return weights.post(b) - weights.post(a);
        })
        .slice(0, 5),
      pages: pages
        .filter(filters.page)
        .sort((a, b) => {
          return weights.page(b) - weights.page(a);
        })
        .slice(0, 5),
      categories: categories
        .filter(filters.category)
        .sort((a, b) => {
          return weights.category(b) - weights.category(a);
        })
        .slice(0, 5),
      tags: tags
        .filter(filters.tag)
        .sort((a, b) => {
          return weights.tag(b) - weights.tag(a);
        })
        .slice(0, 5),
    };
  }

  function searchResultToDOM(keywords, searchResult) {
    $container.empty();
    for (const key in searchResult) {
      $container.append(
        sectionFactory(parseKeywords(keywords), key.toUpperCase(), searchResult[key]),
      );
    }
  }

  function scrollTo($item) {
    if ($item.length === 0) return;
    const wrapperHeight = $container[0].clientHeight;
    const itemTop = $item.position().top - $container.scrollTop();
    const itemBottom = $item[0].clientHeight + $item.position().top;
    if (itemBottom > wrapperHeight + $container.scrollTop()) {
      $container.scrollTop(itemBottom - $container[0].clientHeight);
    }
    if (itemTop < 0) {
      $container.scrollTop($item.position().top);
    }
  }

  function selectItemByDiff(value) {
    const $items = $.makeArray($container.find('.searchbox-result-item'));
    let prevPosition = -1;
    $items.forEach((item, index) => {
      if ($(item).hasClass('active')) {
        prevPosition = index;
      }
    });
    const nextPosition = ($items.length + prevPosition + value) % $items.length;
    $($items[prevPosition]).removeClass('active');
    $($items[nextPosition]).addClass('active');
    scrollTo($($items[nextPosition]));
  }

  function gotoLink($item) {
    if ($item && $item.length) {
      location.href = $item.attr('href');
    }
  }

  $.getJSON(config.contentUrl, (json) => {
    if (location.hash.trim() === '#insight-search') {
      $main.addClass('show');
    }
    $input.on('input', function () {
      const keywords = $(this).val();
      searchResultToDOM(keywords, search(json, keywords));
    });
    $input.trigger('input');
  });

  let touch = false;
  $(document)
    .on('click focus', '.navbar-main .search', () => {
      $main.addClass('show');
      $main.find('.searchbox-input').focus();
    })
    .on('click touchend', '.searchbox-result-item', function (e) {
      if (e.type !== 'click' && !touch) {
        return;
      }
      gotoLink($(this));
      touch = false;
    })
    .on('click touchend', '.searchbox-close', (e) => {
      if (e.type !== 'click' && !touch) {
        return;
      }
      $('.navbar-main').css('pointer-events', 'none');
      setTimeout(() => {
        $('.navbar-main').css('pointer-events', 'auto');
      }, 400);
      $main.removeClass('show');
      touch = false;
    })
    .on('keydown', (e) => {
      if (!$main.hasClass('show')) return;
      switch (e.keyCode) {
        case 27: // ESC
          $main.removeClass('show');
          break;
        case 38: // UP
          selectItemByDiff(-1);
          break;
        case 40: // DOWN
          selectItemByDiff(1);
          break;
        case 13: // ENTER
          gotoLink($container.find('.searchbox-result-item.active').eq(0));
          break;
      }
    })
    .on('touchstart', (e) => {
      touch = true;
    })
    .on('touchmove', (e) => {
      touch = false;
    });
}
