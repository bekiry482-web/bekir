import {localDate, endDate, total, status} from './domain.js';

const DAY=86400000;
const asDate=value=>new Date(`${value}T00:00:00Z`);
const iso=date=>date.toISOString().slice(0,10);
const addDays=(value,days)=>iso(new Date(asDate(value).getTime()+days*DAY));
const readable=value=>value.split('-').reverse().join('.');
export function mondayOf(value=localDate()) {
  const day=asDate(value).getUTCDay();
  return addDays(value,-((day+6)%7));
}
const states={active:'Devam ediyor',soon:'Son seanslar',expired:'Süre doldu',completed:'Tamamlandı'};
export function createExcelReport(ExcelJS,patients,{week=localDate(),theme='light',today=localDate()}={}) {
  const book=new ExcelJS.Workbook();
  book.creator='Fizyo Takip';book.title='Hasta ve haftalık seans takibi';book.subject='Fizyoterapi takip raporu';
  const dark=theme==='dark';
  const palette=dark?{background:'1C2C25',stripe:'24382E',text:'E0ECE4',muted:'A9C0AE',header:'398566',border:'41584A'}:{background:'FFFFFF',stripe:'F0F6F1',text:'243E3A',muted:'688271',header:'2E755A',border:'DCE5DF'};
  const start=mondayOf(week),finish=addDays(start,6);
  function sheet(name,headers,widths,subtitle){
    const ws=book.addWorksheet(name,{properties:{defaultRowHeight:24},views:[{state:'frozen',xSplit:1,ySplit:5,showGridLines:false}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,printTitlesRow:'1:5'}});
    ws.columns=widths.map(width=>({width}));
    ws.mergeCells(1,1,1,headers.length);ws.getCell('A1').value='✳ FİZYO · '+name.toLocaleUpperCase('tr');ws.getRow(1).height=36;
    ws.mergeCells(2,1,2,headers.length);ws.getCell('A2').value=subtitle;ws.getRow(2).height=32;
    ws.mergeCells(3,1,3,headers.length);ws.getCell('A3').value=`Rapor tarihi: ${readable(today)} · ${patients.length} hasta · ${dark?'Koyu':'Açık'} tema`;
    ws.getRow(5).values=headers;ws.getRow(5).height=36;
    for(let r=1;r<=5;r++)for(let c=1;c<=headers.length;c++){
      const cell=ws.getCell(r,c);cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:r===1||r===5?palette.header:palette.background}};
      cell.font={name:'Calibri',size:r===1?19:11,bold:r===1||r===5,color:{argb:r===1||r===5?'FFFFFF':palette.muted}};
      cell.alignment={vertical:'middle',wrapText:true};
    }
    ws.headerFooter.oddFooter='Fizyo Takip | &P / &N';
    function row(values,height=36){const r=ws.addRow(values);r.height=height;r.eachCell({includeEmpty:true},(cell)=>{cell.font={name:'Calibri',size:11,color:{argb:palette.text}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:r.number%2===0?palette.stripe:palette.background}};cell.alignment={vertical:'top',wrapText:true};cell.border={bottom:{style:'hair',color:{argb:palette.border}}};if(cell.value instanceof Date)cell.numFmt='dd.mm.yyyy'});return r;}
    function done(){ws.autoFilter={from:{row:5,column:1},to:{row:Math.max(5,ws.rowCount),column:headers.length}};ws.pageSetup.printArea=`A1:${ws.getColumn(headers.length).letter}${ws.rowCount}`;}
    return {ws,row,done};
  }
  const overview=sheet('Genel bakış',['Hasta','TC kimlik numarası','Doktor','Paket başlangıcı','Paket bitişi','Paket (hafta)','Haftalık hedef','Tamamlanan','Toplam seans','Kalan','Durum',...Array.from({length:8},(_,i)=>`${i+1}. hafta`)],[25,20,25,18,18,14,16,16,16,12,20,...Array(8).fill(15)],'Paket haftaları başlangıç tarihinden itibaren 7 günlük dönemlerdir. Hafta hücreleri: gerçekleşen / hedef; — paket dışı.');
  for(const p of patients){
    const weeks=Array.from({length:8},(_,i)=>{if(i>=+p.weeks)return '—';const from=addDays(p.start,i*7),until=addDays(from,7);return `${p.sessions.filter(s=>s.date>=from&&s.date<until).length} / ${p.weekly}`});
    const row=overview.row([p.name,p.tc||'',p.doctor,asDate(p.start),asDate(endDate(p)),+p.weeks,+p.weekly,p.sessions.length,total(p),Math.max(0,total(p)-p.sessions.length),states[status(p,today)],...weeks]);row.getCell(2).numFmt='@';
  }overview.done();
  const weekly=sheet('Haftalık takip',['Hasta','TC kimlik numarası','Durum',...Array.from({length:7},(_,i)=>`${['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'][i]}\n${readable(addDays(start,i))}`),'Bu hafta toplam','Pakette kalan','Bu haftanın seans notları'],[25,20,20,...Array(7).fill(19),18,18,65],`${readable(start)} – ${readable(finish)} · Günlerde kaydedilmiş seans sayıları gösterilir. Boş günler randevu anlamına gelmez.`);
  for(const p of patients){const sessions=p.sessions.filter(s=>s.date>=start&&s.date<=finish);if(p.start>finish||endDate(p)<=start){if(!sessions.length)continue}
    const notes=sessions.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(s=>`${readable(s.date)}: ${s.note||'Seans tamamlandı'}`).join('\n');
    const row=weekly.row([p.name,p.tc||'',states[status(p,today)],...Array.from({length:7},(_,i)=>{const day=addDays(start,i);return day<p.start||day>=endDate(p)?'Paket dışı':sessions.filter(s=>s.date===day).length}),sessions.length,Math.max(0,total(p)-p.sessions.length),notes],Math.min(300,Math.max(42,sessions.length*30)));row.getCell(2).numFmt='@';
  }weekly.done();
  const details=sheet('Hasta bilgileri',['Hasta','TC kimlik numarası','Telefon','Doktor','Geliş amacı','Rahatsızlığı / tanı','Düzenli ilaç kullanıyor mu?','İlaç adı','Kronik rahatsızlık var mı?','Kronik rahatsızlığın adı','Ameliyatlar','Tedavi planı'],[25,20,20,25,35,40,22,35,22,35,45,65],'Hasta dosyalarındaki bilgiler. TC kimlik numarası ve telefon metin biçiminde korunur.');
  for(const p of patients){const row=details.row([p.name,p.tc||'',p.phone,p.doctor,p.purpose,p.condition,p.medication==='yes'?'Evet':'Hayır',p.medication==='yes'?p.medicationName:'',p.chronic==='yes'?'Evet':'Hayır',p.chronic==='yes'?p.chronicName:'',p.surgeries,p.plan],100);row.getCell(2).numFmt='@';row.getCell(3).numFmt='@';}details.done();
  const history=sheet('Seans geçmişi',['Hasta','TC kimlik numarası','Seans tarihi','Paket haftası','Seans notu'],[30,20,20,18,100],'Kaydedilmiş tüm seanslar; hasta ve tarihe göre sıralıdır. Bu rapor yedek dosyası yerine geçmez.');
  for(const p of patients.slice().sort((a,b)=>a.name.localeCompare(b.name,'tr')))for(const s of p.sessions.slice().sort((a,b)=>a.date.localeCompare(b.date))){const weekIndex=Math.floor((asDate(s.date)-asDate(p.start))/(7*DAY))+1;const row=history.row([p.name,p.tc||'',asDate(s.date),weekIndex>=1&&weekIndex<=p.weeks?weekIndex:'Paket dışı',s.note],55);row.getCell(2).numFmt='@';}history.done();
  book.views=[{activeTab:1}];
  return book;
}
