import axios from 'axios';

const createCard = (i18nInstance, type) => {
  const box = document.createElement('div');
  box.classList.add('card', 'border-0');

  const body = document.createElement('div');
  body.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nInstance.t(type);
  body.append(cardTitle);

  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  box.append(body);
  box.append(list);

  return box;
};

const makeModal = (currentPost, elements) => {
  const {
    modal,
    modalTitle,
    modalBody,
    modalLink,
  } = elements;
  const bgDiv = document.createElement('div');
  bgDiv.classList.add('modal-backdrop', 'fade', 'show');
  document.body.append(bgDiv);
  modalLink.href = currentPost.link;
  modalTitle.textContent = currentPost.title;
  modalBody.textContent = currentPost.description;

  const modalContent = document.querySelector('.modal-content');
  modalContent.classList.add('zindex-tooltip');

  modal.classList.add('show');
  modal.style = 'display:block';
};

export const parseRSS = (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'application/xml');
  const items = parsedData.querySelectorAll('item');
  if (items.length === 0) throw new Error(3);
  const posts = Array.from(items).map((item) => {
    const post = {
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
      read: false,
    };
    return post;
  }).reverse();
  const title = parsedData.querySelector('title').textContent;
  const description = parsedData.querySelector('description').textContent;
  return { title, description, posts };
};

export const renderFeeds = (watchedState, elements, i18nInstance) => {
  elements.feeds.innerHTML = '';
  elements.posts.innerHTML = '';
  const feedsCard = createCard(i18nInstance, 'feeds');
  const postsCard = createCard(i18nInstance, 'posts');

  watchedState.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feed.title;
    const feedDescription = document.createElement('p');
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;
    li.append(feedTitle);
    li.append(feedDescription);
    feedsCard.querySelector('ul').append(li);
  });

  watchedState.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    li.setAttribute('id', post.id);
    const a = document.createElement('a');
    if (post.read) {
      a.classList.add('fw-normal', 'link-secondary');
    } else {
      a.classList.add('fw-bold');
    }

    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');
    a.textContent = post.title;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18nInstance.t('preview');
    li.append(a);
    li.append(button);
    postsCard.querySelector('ul').prepend(li);
  });

  postsCard.addEventListener('click', (e) => {
    const { id } = e.target.parentElement;

    if (e.target.classList.contains('btn')) {
      const currentPost = watchedState.posts.filter((post) => post.id === Number(id))[0];
      makeModal(currentPost, elements);
    }

    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
      watchedState.posts.forEach((post) => {
        if (post.id === Number(id)) {
          post.read = true;
        }
      });
      e.target.classList.remove('fw-bold');
      e.target.classList.add('fw-normal', 'link-secondary');
    }
  });

  elements.feeds.append(feedsCard);
  elements.posts.append(postsCard);
};

export default (url, watchedState) => {
  axios
    .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      if (response.status === 200) {
        return parseRSS(response.data.contents, watchedState);
      }
      throw new Error(404);
    })
    .then((parsedRSS) => {
      parsedRSS.posts.forEach((post) => {
        watchedState.posts.push(post);
      });
      watchedState.feeds.unshift({
        title: parsedRSS.title,
        description: parsedRSS.description,
      });
    })
  // eslint-disable-next-line no-return-assign
    .catch((err) => watchedState.error = err.message);
};
