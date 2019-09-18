Стартовый шаблон на bootstrap 4 + Gulp + Pug + SCSS + BrowserSync

## Как использовать svg спрайт для вставки иконок, например в инпутах

1. Кидаем файл svg иконки в папку \dev\static\images\svg
2. Вставляем pug разметку (миксин) в обертку инпута, первый параметр название файла, второй параметр дополнительный класс модификатора. 
```
.input-wrap.icon-wrap.icon-wrap_right
	+icon('calendar', 'order')
```

3. Класс icon-wrap_right нужен для левого и правого позиционирования иконки внутри обертки
```css
// Отступ текста слева от иконки
.icon-wrap_right select.main-filter-form__rooms {
  padding-right: calc(1.3em + 10px + 8px);
}
.icon-wrap_right input.main-filter-form__rooms {
  padding-right: calc(1.3em + 10px + 8px);
}
```
