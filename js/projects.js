(function(){
  var grid = document.getElementById('projects-grid');
  var seeAllBox = document.getElementById('projects-see-all');

  function shuffle(arr){
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function render(projects){
    if (!projects || !projects.length){
      grid.innerHTML = '<div class="project-card empty"><div class="plus">+</div><p>No projects yet. Add one in <span class="mono-inline">projects.json</span>.</p></div>';
      return;
    }
    var html = projects.map(function(p, pIdx){
      var tags = (p.tags || []).map(function(t){ return '<span>' + escapeHtml(t) + '</span>'; }).join('');
      var linkHtml = p.link
        ? '<a class="project-link" href="' + escapeHtml(p.link) + '" target="_blank" rel="noopener">View project →</a>'
        : '';
      var statusClass = (p.status || '').toLowerCase() === 'sample' ? ' is-sample' : '';

      // Supports either "images": [...] (multiple screenshots) or the older single "image" field.
      var imgs = (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);
      var navHtml = '';
      var dotsHtml = '';
      if (imgs.length > 1){
        navHtml =
          '<button type="button" class="gallery-nav gallery-prev" data-dir="-1" aria-label="Previous screenshot">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>' +
          '</button>' +
          '<button type="button" class="gallery-nav gallery-next" data-dir="1" aria-label="Next screenshot">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
          '</button>';
        dotsHtml = '<div class="gallery-dots">' + imgs.map(function(_, i){
          return '<button type="button" class="gallery-dot' + (i === 0 ? ' active' : '') + '" data-i="' + i + '" aria-label="Screenshot ' + (i+1) + '"></button>';
        }).join('') + '</div>';
      }

      return (
        '<div class="project-card">' +
          '<div class="project-shot" data-project="' + pIdx + '">' +
            (p.status ? '<span class="project-status' + statusClass + '">' + escapeHtml(p.status) + '</span>' : '') +
            '<img src="' + escapeHtml(imgs[0] || '') + '" alt="' + escapeHtml(p.title) + ' screenshot" loading="lazy">' +
            navHtml + dotsHtml +
          '</div>' +
          '<div class="project-body">' +
            '<span class="project-cat">' + escapeHtml(p.category || '') + '</span>' +
            '<h3>' + escapeHtml(p.title) + '</h3>' +
            '<p>' + escapeHtml(p.description || '') + '</p>' +
            '<div class="project-tags">' + tags + '</div>' +
            linkHtml +
          '</div>' +
        '</div>'
      );
    }).join('');
    grid.innerHTML = html;

    // Wire up prev/next arrows and dots for any card with multiple screenshots.
    var shots = grid.querySelectorAll('.project-shot');
    shots.forEach(function(shot){
      var pIdx = Number(shot.getAttribute('data-project'));
      var imgs = (projects[pIdx].images && projects[pIdx].images.length)
        ? projects[pIdx].images
        : (projects[pIdx].image ? [projects[pIdx].image] : []);
      if (imgs.length < 2) return;

      var current = 0;
      var imgEl = shot.querySelector('img');
      var dotEls = shot.querySelectorAll('.gallery-dot');

      function show(i){
        current = (i + imgs.length) % imgs.length;
        imgEl.src = imgs[current];
        dotEls.forEach(function(d, j){ d.classList.toggle('active', j === current); });
      }

      shot.querySelectorAll('.gallery-nav').forEach(function(btn){
        btn.addEventListener('click', function(e){
          e.preventDefault(); e.stopPropagation();
          show(current + Number(btn.getAttribute('data-dir')));
        });
      });
      dotEls.forEach(function(dot, j){
        dot.addEventListener('click', function(e){
          e.preventDefault(); e.stopPropagation();
          show(j);
        });
      });
    });
  }

  fetch('projects.json')
    .then(function(res){
      if (!res.ok) throw new Error('Could not load projects.json');
      return res.json();
    })
    .then(function(allProjects){
      if (allProjects && allProjects.length > 3){
        render(shuffle(allProjects).slice(0, 3));
        seeAllBox.innerHTML = '<button type="button" class="btn btn-ghost" id="see-all-projects-btn">See all ' + allProjects.length + ' projects</button>';
        document.getElementById('see-all-projects-btn').addEventListener('click', function(){
          render(allProjects);
          seeAllBox.innerHTML = '';
        });
      } else {
        render(allProjects);
      }
    })
    .catch(function(){
      grid.innerHTML =
        '<div class="project-card empty">' +
          '<div class="plus">i</div>' +
          '<p>Projects couldn\'t be loaded. If you\'re opening this file directly, run it through a local server (or your live site) so <span class="mono-inline">projects.json</span> can be fetched.</p>' +
        '</div>';
    });
})();

(function(){
  var row = document.getElementById('clients-row');
  if (!row) return;

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function render(clients){
    if (!clients || !clients.length){
      row.innerHTML =
        '<div class="clients-empty"><div class="plus">+</div>' +
        '<p>No client logos added yet. Add one in <span class="mono-inline">clients.json</span> once a project ships.</p></div>';
      return;
    }
    row.innerHTML = clients.map(function(c){
      var img = '<img src="' + escapeHtml(c.logo) + '" alt="' + escapeHtml(c.name) + '" loading="lazy">';
      return c.url
        ? '<a class="client-logo" href="' + escapeHtml(c.url) + '" target="_blank" rel="noopener">' + img + '</a>'
        : '<span class="client-logo">' + img + '</span>';
    }).join('');
  }

  fetch('clients.json')
    .then(function(res){ if (!res.ok) throw new Error('missing'); return res.json(); })
    .then(render)
    .catch(function(){
      row.innerHTML =
        '<div class="clients-empty"><div class="plus">+</div>' +
        '<p>No client logos added yet. Add <span class="mono-inline">clients.json</span> to the root once a project ships.</p></div>';
    });
})();

(function(){
  var row = document.getElementById('reviews-row');
  if (!row) return;

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function starsHtml(rating){
    rating = Math.max(0, Math.min(5, Number(rating) || 5));
    var out = '';
    for (var i = 1; i <= 5; i++){
      out += '<svg viewBox="0 0 20 20" class="' + (i <= rating ? '' : 'dim') + '"><path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.7l-5.2 2.8 1-5.8L1.6 7.6l5.8-.8L10 1.5Z"/></svg>';
    }
    return out;
  }

  function render(reviews){
    if (!reviews || !reviews.length){
      row.innerHTML =
        '<div class="clients-empty"><div class="plus">+</div>' +
        '<p>No reviews featured yet. Add one in <span class="mono-inline">reviews.json</span> once you have a real one to share.</p></div>';
      return;
    }
    row.innerHTML = reviews.map(function(r){
      return (
        '<div class="review-card">' +
          '<div class="review-stars">' + starsHtml(r.rating) + '</div>' +
          '<p class="review-quote">' + escapeHtml(r.quote || '') + '</p>' +
          '<div class="review-author">' +
            '<span class="review-name">' + escapeHtml(r.name || 'Anonymous') + '</span>' +
            (r.role ? '<span class="review-role">' + escapeHtml(r.role) + '</span>' : '') +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  fetch('reviews.json')
    .then(function(res){ if (!res.ok) throw new Error('missing'); return res.json(); })
    .then(render)
    .catch(function(){
      row.innerHTML =
        '<div class="clients-empty"><div class="plus">+</div>' +
        '<p>No reviews featured yet. Add <span class="mono-inline">reviews.json</span> to the root once you have a real one to share.</p></div>';
    });
})();

(function(){
  var form = document.getElementById('native-review-form');
  if (!form) return;

  var status = document.getElementById('nf-status');

  // Field IDs confirmed from a real pre-filled link on 2026-08-19.
  var GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSdB1itjwVc00506m31I0zyvplWjTo2UewGycakwldm-MwftBA/formResponse';
  var ENTRY = {
    name:    'entry.131459030',
    email:   'entry.1522449081',
    type:    'entry.335266797',
    rating:  'entry.1342302240',
    message: 'entry.106208887',
    area:    'entry.63558600',
    source:  'entry.1502015875',
    consult: 'entry.557465917'
  };

  document.querySelectorAll('.nf-segmented').forEach(function(group){
    group.querySelectorAll('.nf-seg-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        group.querySelectorAll('.nf-seg-btn').forEach(function(b){
          b.classList.remove('active');
          b.setAttribute('aria-pressed','false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed','true');
        group.dataset.selected = btn.dataset.value;

        if (group.dataset.field === 'path'){
          var reviewOnly = form.querySelectorAll('.nf-review-only');
          reviewOnly.forEach(function(el){ el.hidden = btn.dataset.value !== 'Review'; });
        }
      });
    });
  });

  var starGroup = document.querySelector('.nf-star-rating');
  starGroup.querySelectorAll('.nf-star').forEach(function(star){
    star.addEventListener('click', function(){
      var val = Number(star.dataset.value);
      starGroup.dataset.selected = val;
      starGroup.querySelectorAll('.nf-star').forEach(function(s){
        s.classList.toggle('active', Number(s.dataset.value) <= val);
      });
    });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();

    var name = document.getElementById('nf-name').value.trim();
    var email = document.getElementById('nf-email').value.trim();
    var path = document.querySelector('.nf-segmented[data-field="path"]').dataset.selected || 'Question';
    var type = document.querySelector('.nf-segmented[data-field="type"]').dataset.selected || '';
    var rating = starGroup.dataset.selected || '';

    if (!name || !email || (path === 'Review' && (!type || !rating)) || !document.getElementById('nf-consent').checked){
      status.textContent = path === 'Review'
        ? 'Please fill in Name, Email, Type, Rating, and consent.'
        : 'Please fill in Name, Email, and consent.';
      status.className = 'nf-status err';
      return;
    }

    var message = document.getElementById('nf-message').value.trim();
    var area = document.getElementById('nf-area').value;
    var consult = document.querySelector('.nf-segmented[data-field="consult"]').dataset.selected || '';
    var sources = Array.prototype.map.call(
      document.querySelectorAll('.nf-checkboxes input:checked'),
      function(cb){ return cb.value; }
    );

    var body = new URLSearchParams();
    body.append(ENTRY.name, name);
    body.append(ENTRY.email, email);
    body.append(ENTRY.type, path === 'Review' ? type : 'Question');
    if (path === 'Review') body.append(ENTRY.rating, rating);
    if (message) body.append(ENTRY.message, message);
    if (area) body.append(ENTRY.area, area);
    if (consult) body.append(ENTRY.consult, consult);
    sources.forEach(function(s){ body.append(ENTRY.source, s); });

    fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })
    .then(function(){
      status.textContent = 'Thank you — your submission has been received!';
      status.className = 'nf-status ok';
      form.reset();
      document.querySelectorAll('.nf-seg-btn.active').forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      var pathGroup = document.querySelector('.nf-segmented[data-field="path"]');
      pathGroup.querySelector('[data-value="Question"]').classList.add('active');
      pathGroup.querySelector('[data-value="Question"]').setAttribute('aria-pressed','true');
      pathGroup.dataset.selected = 'Question';
      form.querySelectorAll('.nf-review-only').forEach(function(el){ el.hidden = true; });
      document.querySelectorAll('.nf-star.active').forEach(function(s){ s.classList.remove('active'); });
      document.querySelectorAll('.nf-segmented').forEach(function(g){ delete g.dataset.selected; });
      delete starGroup.dataset.selected;
    })
    .catch(function(){
      status.textContent = 'Something went wrong — please try again or email us directly.';
      status.className = 'nf-status err';
    });
  });
})();


(function(){
  var box = document.getElementById('image-lightbox');
  var image = document.getElementById('lightbox-image');
  var close = box.querySelector('.lightbox-close');
  if (!box) return;
  function hide(){ box.hidden = true; image.src = ''; document.body.style.overflow = ''; }
  document.addEventListener('click', function(e){
    var img = e.target.closest('.project-shot img');
    if (!img) return;
    image.src = img.src;
    image.alt = img.alt;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    close.focus();
  });
  close.addEventListener('click', hide);
  box.addEventListener('click', function(e){ if (e.target === box || e.target === image) hide(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !box.hidden) hide(); });
})();
