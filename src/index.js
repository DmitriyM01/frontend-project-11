import { string } from 'yup';
import './index.scss';

const form = document.querySelector('form');
const textInput = document.querySelector('#url-input');
const feedbackBox = document.querySelector('#feedback');

const schema = string().url().required();

const state = {
    previousValue: '',
    error: ''
};

form.addEventListener('submit', (event) => {
    event.preventDefault();
    state.error = '';

    const data = new FormData(form);
    const inputValue = data.get('url').trim();

    if (inputValue === state.previousValue) state.error = 'Такой RSS уже есть';

    if (!schema.isValidSync(inputValue)) state.error = 'Ссылка должна быть валидным URL';

    if (state.error.length > 0) {
        feedbackBox.classList.remove('text-succes');
        feedbackBox.classList.add('text-danger');
        feedbackBox.textContent = state.error;
    } else {
        feedbackBox.classList.remove('text-danger');
        feedbackBox.classList.add('text-success');
        feedbackBox.textContent = 'RSS успешно загружен';
    }
    textInput.value = '';
    textInput.focus();
    console.log(state);
    state.previousValue = inputValue;
});
