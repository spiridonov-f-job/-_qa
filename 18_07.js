const puppeteer = require('puppeteer');

function delay(time) {
  return new Promise(function(resolve) {
      setTimeout(resolve, time)
  });
}

async function redLog(str){
    console.log("\x1b[41m%s\x1b[0m", str)
  }
  
(async () => {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  await page.goto('https://its-tula.appmath.ru/')
  await page.setViewport({width:1400, height:600})

  names1 = ['Детекторы транспорта', 'Проезды и нарушения', 'Прогноз транспортной обстановки', 'Светофорные объекты', 
  'Видеонаблюдение', 'Проиcшествия', 'Работоспособность оборудования', 'Информирование на дорогах', 'Общественный транспорт', 
  'Парковочное пространство', 'Состояние дорог', 'Уведомления', 'Отчеты и аналитика']
  
  names2 = []

  subnames1 = ['Детекторы транспорта', 'Wi-Fi', 'КФВФ', 'ВГК', 'Транзитные потоки', 'Поиск фиксаций', 'Активные планы', 
  'Выбор плана координации', 'Перейти в управление СО', 'Ситуационный центр', 'ДТП', 'Потенциально опасные и аварийные участки', 
  'УДЗ', 'Табло отображения информации', 'Управление ТОИ', 'Парковки', 'Нарушения на парковках' , 'Службы эвакуации', 'Освещение', 
  'Метеостанции', 'Экология', 'Ремонты', 'Перекрытия', 'Цифровая карта', 'Сводная информация', 'Отчёты', 'Аналитические графики']

  subnames2 = []

  await(await page.waitForXPath("(//input[@class='loginLandscape__input'])[1]")).type("spiridonov_fl")
  await(await page.waitForXPath("(//input[@class='loginLandscape__input'])[2]")).type("mtb!9@-s#Y[MMjX!")
  // await delay (10000)
  await(await page.waitForXPath("//button[contains (text(), 'Войти')]", {timeout:10000})).click()

  //Подсчет количества разделов
  await delay(2000)
  const countText = await page.$x("//button[@class='btn modules__module' and text()]", {timeout:5000})
  const count1 = countText.length
  console.log(count1)

  //Запись в массив
  for(a=1;a<=count1;a++){
    await delay(500)
    await(await page.waitForXPath("(//div[@class='modules']/button[text()])["+a+"]", {timeout:15000})).click() 

    let element = await page.waitForXPath("(//div[@class='modules']/button[text()])["+a+"]", {timeout:15000})
    let value = await page.evaluate(element => element.textContent, element)

    let value_edit = value.trim()
    names2.push(value_edit)

    //Подсчет количества подразделов
    await delay(2000)
    const countText = await page.$x("//div[@class='scrollbar menu__right']//button[@class='btn layer__header' and text()]", {timeout:3000})
    const count2 = countText.length
    console.log(count2)

    //Запись в массив подразделов
    try{
        for(i=1;i<=count2;i++) {
          let element1 = await page.waitForXPath("(//div[@class='scrollbar menu__right']//button[@class='btn layer__header' and text()])["+i+"]", {timeout:15000})
          let value1 = await page.evaluate(element1 => element1.textContent, element1)
      
          let value_edit1 = value1.trim()
          subnames2.push(value_edit1)
        }
  
      } catch{}

    await(await page.waitForXPath("//button[@class='btn back landscape__back']")).click() 
    
}

subnames2.splice(6, 0, 'Активные планы')
  //Проверки
  redLog("Проверка разделов")
  for (a=0; a<names1.length; a++) {
    await delay(500)
    if (names1[a]=== names2[a]) {
        console.log(names1[a] + '=' + names2[a] + " - Совпадает")
    }
    else {
        redLog(names1[a] + '=' + names2[a] + " - Не совпадает")
    }
  }

  redLog("Проверка подразделов")

  for (a=0; a<subnames1.length; a++) {
    await delay(500)
    if (subnames1[a]=== subnames2[a]) {
        console.log(subnames1[a] + ' = ' + subnames2[a] + " - Совпадает")
    }
    else {
        redLog(subnames1[a] + ' = ' + subnames2[a] + " - Не совпадает")
    }
  }
  await page.reload()
  await delay(1000)

  //Открываем раздел светофорные планы -> выбор плана кооринации
  await(await page.waitForXPath("//button[contains (text(),'"+names2[3]+"')]", {timeout:2000})).click()
  await delay(500)
  await(await page.waitForXPath("//button[contains (text(),'"+subnames2[7]+"')]", {timeout:2000})).click()

  //Что открывает?
  try{
    await page.waitForXPath("//span[contains(text(),'Отправка плана координации')]")
    b = 1
  } catch(err){
    redLog("не открылось окно 'Выбор плана координации'")
    b = 0
  }

  if (b===1){
    await delay(1000)
    await(await page.waitForXPath("//span[contains(text(),'Зона №6: Октябрьская')]")).click()
    try{
      await delay(1000)
      await(await page.waitForXPath("//button[contains(text(),'Настроить план')]")).click()
      c = 1
    } catch(err){
      c = 0
    }
    redLog("Тыкнули")
    //Создание правила
    if (c === 1){
      await(await page.waitForXPath("//button[contains(text(),'Создать правило')]")).click()
      await(await page.waitForXPath("//textarea[@class='coordination-plan__rule-comment coordination-plan__text']")).click()
      await page.keyboard.type("Тест")
      await(await page.waitForXPath("//button[contains(text(), 'Добавить правило')]")).click() 
      await(await page.waitForXPath("//button[contains(text(), 'Все правила списком')]")).click()
      
      //Проверка, что правило создалось
      try{
        await page.waitForXPath("//span[contains(text(),'Тест')]")
        console.log("Правило создалось")
      } catch(err){
        redLog("Правило не создалось")
      }
      //Удаление правила
      await(await page.waitForXPath("//button[@class='coordination-plan__schedule-list-button']")).click()
      await delay(2000)
      await(await page.waitForXPath("//div[@class='its__dialog-action']/button[contains(text(),'Да')]")).click()
      
      //Проверка, что правило удалилось
      try{
        await page.waitForXPath("//span[contains(text(),'Тест')]", {timeout:10000})
        console.log("Правило не удалилось")
      } catch(err){
        console.log("Правило удалилось")
      }
    }
  }

  await delay(1000)
  await browser.close()
} )()