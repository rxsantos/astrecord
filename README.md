# MonitorAsterisk

<dl>
	<dt>Escutar ligações gravadas pelo Asterisk através de uma pagina em PHP.</dt>
	<dd>É possivel filtar as ligaçoes por ramal, mes e ano e ainda exportar para o Excel</dd>
</dl>

Para que funcione é necessario alimentar um banco de dados Mysql 
com um Script que monitore a pasta /var/spool/asterisk/monitor/.crie um link 
simbolico chamado "audio" dentro da pasta principal da sua pagina para o local onde o
asterisk grava as ligaçoes.
```bash
usuario@servidor:/var/www$ ln -ls /var/spool/asterisk/monitor/ audio
```
Nas configuraçoes do Asterisk  altere a string de salvamento no arquivo de configuração 'extensions.conf'.
A string tem que ter o seguinte formato: 
```
exten => _XX.,1,Set(MONITOR_FILENAME=${STRFTIME(${EPOCH},,%Y-%m-%d_%H.%M.%S)}_${CDR(src)}_${CDR(dst)}_${CDR(billsec)})
exten => _XX.,n,Mixmonitor(${MONITOR_FILENAME}.wav)
exten => _XX.,n,Dial(SIP/${EXTEN}@tronco-que-centraliza-todas-ligacoes,50)
```
Para o banco de dados, crie as tabelas:
```SQL
CREATE TABLE `Ligacoes` (
	`id_ligacao` INT(11) NOT NULL AUTO_INCREMENT,
	`ramal` INT(11) NULL DEFAULT NULL,
	`data_ligacao` DATETIME NULL DEFAULT NULL,
	`arquivo` VARCHAR(254) NULL DEFAULT NULL,
	`numero` VARCHAR(20) NULL DEFAULT NULL,
	`duracao` DOUBLE NULL DEFAULT NULL,
	`bk` BIT(1) NULL DEFAULT NULL,
	PRIMARY KEY (`id_ligacao`)
)
```
```SQL
CREATE TABLE `Usuario` (
	`id_usuario` INT(11) NOT NULL AUTO_INCREMENT,
	`nome` VARCHAR(254) NULL DEFAULT NULL,
	`ramal` INT(11) NULL DEFAULT NULL,
	PRIMARY KEY (`id_usuario`)
)
```
E por fim o script que varre o o diretório /var/spool/asterisk/monitor/ e alimenta a tabela Ligacoes

(fica por sua conta crirar um procedimento de varredura altomatica)


```bash
#!/bin/bash
local="/var/spool/asterisk/monitor"
cd $local
for i in `ls`; do 
    ramal=`cut  -d_ -f 3 <<< $i`
     data=`cut  -d_ -f 1 <<< $i`
     hora=`cut  -d_ -f 2 <<< $i`
   numero=`cut  -d_ -f 4 <<< $i`
    dataL="$data $(sed "s/\./\:/g" <<< $hora)"
  arquivo=$i
    query=`echo  "select ramal from Ligacoes where arquivo = '$arquivo'  " | mysql MLigacao -u root -pmaster`
	if [ ${#query} -lt 4 ];then
		sox $i -n stat 2>/tmp/Mtmp.txt 
		tmp=`cat /tmp/Mtmp.txt | grep Len`
		duracao=`echo $tmp | cut -d: -f2`
    	rm /tmp/Mtmp.txt 
    echo "insert into Ligacoes (ramal,data_ligacao,arquivo,numero,duracao,bk) values ($ramal,'$dataL','$arquivo','$numero',$duracao,0)"  | mysql MLigacao -u root -pmaster
	fi
done
```

# Screenshot

## Usuario
![usuarios](https://user-images.githubusercontent.com/7445276/48920323-74a49300-ee7f-11e8-8f24-51ef12e893b3.png) 
## Filtro1
![filtro1](https://user-images.githubusercontent.com/7445276/48920340-8ab25380-ee7f-11e8-94e7-8d63a2e01698.png)
## Filtro2
![filtro2](https://user-images.githubusercontent.com/7445276/48920342-8b4aea00-ee7f-11e8-930b-4c01f0e11b2c.png) 
## Lista de ligações
![ligacoes](https://user-images.githubusercontent.com/7445276/48920341-8b4aea00-ee7f-11e8-8e8f-cb77169e508a.png) 
## Exportar para o Excel
![excel1](https://user-images.githubusercontent.com/7445276/48920344-8b4aea00-ee7f-11e8-962c-ae4462ef44ad.png) 
## Planilha com resultados
![excel2](https://user-images.githubusercontent.com/7445276/48920343-8b4aea00-ee7f-11e8-82f0-c9a58b20de93.png) 


 
























