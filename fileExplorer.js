const fs = require('fs'), stdin = process.stdin, stdout = process.stdout

fs.readdir(process.cwd(), (err, files) => {
	let stats = []
	console.log('') // 空出一个空行

	if (!files.length) {
		console.log(`	No file to show!`) // \033[31m  033[39m 让文本呈现红色
	}

	console.log('	Select which file or directory you want to see \n')


	function file(i) {
		const filename = files[i]

		fs.stat(__dirname + '/' + filename, (err, stat) => {
			stats[i] = stat
			if (stat.isDirectory()) {
				fs.readdir(__dirname + '/' + filename, (err, files) => {
					console.log('')
					console.log('	' + i + '	' +filename + '		(' + files.length + '	files)')
					files.forEach((file) => {
						console.log('		-' + file)
					})
				})
				console.log('')
			} else {
				console.log('	' + i + '	' + filename)
			}

			if (++i == files.length) {
				read()
			} else {
				file(i)
			}
		})
	}
	
	function read() {
		console.log('')
		stdout.write('	Enter your choice: ')
		stdin.resume() // 等待用户输入
		stdin.setEncoding('utf8') // 设置编码流为 utf8，这样就能支持特殊字符了
		stdin.on('data', option)
	}

	function option(data) {
		const filename = files[Number(data)]
		if (!files[Number(data)]) { // 将 utf-8 编码的字符串类型 data 转化为 Number 类型方便做检查
			stdout.write('	Enter your choice: ')
		} else {
			stdin.pause() // 检查通过，将流暂停（回到默认状态），以便之后做完 fs 操作后，程序能够顺利退出
			fs.readFile(__dirname + '/' + filename, 'utf8', (err, data) => {
				console.log('')
				console.log(data)
			})
		}
	}

	file(0)
})