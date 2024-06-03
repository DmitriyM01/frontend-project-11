import { setLocale, string } from 'yup';
import onChange from 'on-change';
import getRSS, { parseRSS, renderFeeds } from './rss.js';
import locale from '../locales/yupLocale.js'
import axios from 'axios';

export default (state, elements, i18nInstance) => {
    setLocale(locale);
    const schema = string().url().required();

    const watchedState = onChange(state, (path, value) => {
        switch (path) {
            case 'value':
                schema.notOneOf(state.urls)
                .validate(value)
                .then((url) => {
                    // Здесь происходит что-то, если урл валидный
                    getRSS(url, watchedState, i18nInstance);
                    state.urls.push(url);
                    state.value = '';
                    elements.textInput.value = '';
                })
                .catch((err) => {
                    // Здесь происходит что-то, если урл невалидный
                    watchedState.error = err.message
                });
                break;
            case 'feeds':
                renderFeeds(watchedState, elements, i18nInstance)
                elements.textInput.classList.remove('is-invalid');
                elements.textInput.classList.add('is-valid');
                elements.feedback.classList.remove('text-danger');
                elements.feedback.classList.add('text-success');
                elements.feedback.textContent = i18nInstance.t('feedbackRequest.success');

                // При первом изменении в поле фидов в состоянии запускается таймер, который получает обновленные данные,
                // парсит их и вносит в поле фидс, после чего все повторяется уже само собой рекурсивно
                // -> Изменилось поле фидс -> Обработчик запустился, получил данные, вставил их в поле фидс -> фиды обновились,
                // обработчик снова запустился
                setTimeout(() => {
                    watchedState.feeds = [];
                    watchedState.urls.forEach((url) => {
                        axios
                            .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
                            .then((response) => {
                                if (response.data.status.http_code === 200) return parseRSS(response.data.contents);
                            }).then((data) => {
                                watchedState.feeds.unshift(data)
                            })
                            // watchedState.feeds.unshift(getRSS(url, watchedState, i18nInstance))
                            // console.log(getRSS(url, watchedState, i18nInstance))
                        })
                }, 5000)
                break;
            case 'error':
                console.log(value)
                elements.textInput.classList.remove('is-valid');
                elements.textInput.classList.add('is-invalid');
                elements.feedback.classList.remove('text-succes');
                elements.feedback.classList.add('text-danger');
                elements.feedback.textContent = i18nInstance.t(`feedbackRequest.${value}`);
                break;
            default:
                console.log(path);
        }
    });
    return watchedState;
};
