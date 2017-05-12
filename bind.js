
function compile (node, vm){
	// 节点类型为元素
	if (node.nodeType === 1) {
		var attr = node.attributes;
		// 解析属性
		for (var i = 0; i < attr.length; i++){
			if(attr[i].nodeName === 'v-model'){
					var name = attr[i].nodeValue;// 获取绑定的属性的名字

					node.addEventListener('input', function(e){
						// 给相应的data属性赋值，触发set
						vm.data[name] = e.target.value
					})

					node.value = vm.data[name];// 替换输入框的值为data中的值
					node.removeAttribute('v-model');
				}
			};
		}
	// 节点类型为text
	else if(node.nodeType === 3) {
		var reg = /\{\{(.*)\}\}/;// 匹配{{}}内任意字符
		if(reg.test(node.nodeValue)) {
			var name = RegExp.$1; //匹配到的第一个字符
			name = name.trim();

			// node.nodeValue = vm[name];
				new Watcher(vm, node, name);// 观察输入的值(订阅)
			}
		}
	};

	// 输入变化观察
	function Watcher(vm, node, name){
		Pubsub.target = this;
		this.name = name;
		this.node = node;
		this.vm = vm;
		this.update();
		Pubsub.target = null;
	}

	Watcher.prototype = {
		update(){
			this.get();
			this.node.nodeValue = this.value
		},
		// 获取data中的属性值
		get(){
			this.value = this.vm.data[this.name] // 触发相应的get
		}
	}

	function getAllNode(node, vm){
		var length = node.childNodes.length;
		for(var i = 0; i < length; i++){
			compile(node.childNodes[i], vm)
		}
	};

	function Pubsub(){
		this.subs = []
	}

	Pubsub.prototype = {
		addSub: function(sub){
			this.subs.push(sub);
		},
		pub: function(){
			this.subs.forEach(function(sub){
				sub.update();
			})
		}
	}

	function active (obj, key, val) {

		var pubsub = new Pubsub();

		Object.defineProperty(obj.data, key, {
			get(){
				// 添加订阅者Watcher到主题对象Pubsub
				if(Pubsub.target){
					pubsub.addSub(Pubsub.target);
				}
				return val;
			},
			set(newVal){	
				console.log(val);
				if (newVal === val){ return };
				val = newVal;

				// 发出通知
				pubsub.pub();
			}
		});
	}

	function observe (obj, vm){
		for(var key in obj){
			active(vm, key, obj[key]);
		}
	}

	function Vue(options){
		this.data = options.data;

		var data = this.data;
		observe(data, this);


		this.id = options.el;
		getAllNode(document.getElementById(this.id), this);
	};
	var vm = new Vue({
		el: 'app',
		data: {
			text: 'hello world'
		}
	})