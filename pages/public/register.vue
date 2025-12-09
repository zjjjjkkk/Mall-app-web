<template>
	<view class="register-container">
		<!-- 背景装饰 -->
		<view class="bg-decoration">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>

		<!-- 返回按钮 -->
		<view class="back-btn" @click="navBack">
			<text class="back-icon">‹</text>
		</view>

		<!-- 主要内容区域 -->
		<view class="content-wrapper">
			<!-- Logo和标题区域 -->
			<view class="header-section">
				<view class="logo-wrapper">
					<text class="logo-text">Mall</text>
				</view>
				<view class="title">创建账户</view>
				<view class="subtitle">注册新账户，开启购物之旅</view>
			</view>

			<!-- 表单区域 -->
			<view class="form-section">
				<!-- 用户名输入框 -->
				<view class="input-wrapper" :class="{ 'error': errors.username }">
					<view class="input-icon">
						<text class="icon-text">👤</text>
					</view>
					<input 
						class="input-field"
						type="text" 
						v-model="form.username" 
						placeholder="请输入用户名（2-64个字符）" 
						placeholder-class="input-placeholder"
						maxlength="64"
						@input="clearError('username')"
						@focus="handleInputFocus('username')"
						@blur="handleInputBlur('username')"
					/>
					<view class="input-line" :class="{ 'active': focusedField === 'username' }"></view>
				</view>
				<view class="error-message" v-if="errors.username">{{ errors.username }}</view>

				<!-- 手机号输入框 -->
				<view class="input-wrapper" :class="{ 'error': errors.phone }">
					<view class="input-icon">
						<text class="icon-text">📱</text>
					</view>
					<input 
						class="input-field"
						type="number" 
						v-model="form.phone" 
						placeholder="请输入手机号" 
						placeholder-class="input-placeholder"
						maxlength="11"
						@input="clearError('phone')"
						@focus="handleInputFocus('phone')"
						@blur="handleInputBlur('phone')"
					/>
					<view class="input-line" :class="{ 'active': focusedField === 'phone' }"></view>
				</view>
				<view class="error-message" v-if="errors.phone">{{ errors.phone }}</view>

				<!-- 密码输入框 -->
				<view class="input-wrapper" :class="{ 'error': errors.password }">
					<view class="input-icon">
						<text class="icon-text">🔒</text>
					</view>
					<input 
						class="input-field"
						type="text" 
						v-model="form.password" 
						placeholder="8-18位数字、字母组合" 
						placeholder-class="input-placeholder"
						maxlength="64"
						password
						@input="clearError('password')"
						@focus="handleInputFocus('password')"
						@blur="handleInputBlur('password')"
					/>
					<view class="input-line" :class="{ 'active': focusedField === 'password' }"></view>
				</view>
				<view class="error-message" v-if="errors.password">{{ errors.password }}</view>

				<!-- 确认密码输入框 -->
				<view class="input-wrapper" :class="{ 'error': errors.confirmPwd }">
					<view class="input-icon">
						<text class="icon-text">🔒</text>
					</view>
					<input 
						class="input-field"
						type="text" 
						v-model="form.confirmPwd" 
						placeholder="请再次输入密码" 
						placeholder-class="input-placeholder"
						maxlength="64"
						password
						@confirm="toRegister"
						@input="clearError('confirmPwd')"
						@focus="handleInputFocus('confirmPwd')"
						@blur="handleInputBlur('confirmPwd')"
					/>
					<view class="input-line" :class="{ 'active': focusedField === 'confirmPwd' }"></view>
				</view>
				<view class="error-message" v-if="errors.confirmPwd">{{ errors.confirmPwd }}</view>

				<!-- 用户协议 -->
				<view class="agreement-section">
					<view class="agreement-checkbox" @click="toggleAgreement">
						<view class="checkbox" :class="{ 'checked': agreed }">
							<text class="check-icon" v-if="agreed">✓</text>
						</view>
						<text class="agreement-text">
							我已阅读并同意
							<text class="link-text" @click.stop="showAgreement">《用户协议》</text>
							和
							<text class="link-text" @click.stop="showPrivacy">《隐私政策》</text>
						</text>
					</view>
				</view>

				<!-- 注册按钮 -->
				<button 
					class="register-btn" 
					:class="{ 'loading': registering, 'disabled': !agreed }"
					@click="toRegister" 
					:disabled="registering || !agreed"
				>
					<text v-if="!registering">立即注册</text>
					<text v-else>注册中...</text>
				</button>
			</view>

			<!-- 登录链接 -->
			<view class="login-link">
				<text class="link-text">已有账号？</text>
				<text class="link-btn" @click="toLogin">立即登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		memberRegister
	} from '@/api/member.js';
	
	export default {
		data() {
			return {
				form: {
					username: '',
					phone: '',
					password: '',
					confirmPwd: ''
				},
				registering: false,
				agreed: false,
				focusedField: '',
				errors: {
					username: '',
					phone: '',
					password: '',
					confirmPwd: ''
				}
			};
		},
		methods: {
			// 返回上一页
			navBack() {
				uni.navigateBack();
			},
			
			// 跳转到登录页面
			toLogin() {
				uni.navigateTo({
					url: '/pages/public/login'
				});
			},
			
			// 输入框聚焦
			handleInputFocus(field) {
				this.focusedField = field;
				this.clearError(field);
			},
			
			// 输入框失焦
			handleInputBlur(field) {
				this.focusedField = '';
			},
			
			// 清空指定字段错误提示
			clearError(field) {
				this.errors[field] = '';
			},
			
			// 切换协议同意状态
			toggleAgreement() {
				this.agreed = !this.agreed;
			},
			
			// 显示用户协议
			showAgreement() {
				uni.showModal({
					title: '用户协议',
					content: '欢迎使用Mall电商平台！使用本平台即表示您同意遵守相关服务条款。',
					showCancel: false
				});
			},
			
			// 显示隐私政策
			showPrivacy() {
				uni.showModal({
					title: '隐私政策',
					content: '我们重视您的隐私，会妥善保护您的个人信息安全。',
					showCancel: false
				});
			},
			
			// 表单验证
			validateForm() {
				let isValid = true;
				
				// 用户名验证
				if (!this.form.username.trim()) {
					this.errors.username = '请输入用户名';
					isValid = false;
				} else if (this.form.username.length < 2 || this.form.username.length > 64) {
					this.errors.username = '用户名长度应在2-64个字符之间';
					isValid = false;
				}
				
				// 手机号验证
				if (!this.form.phone) {
					this.errors.phone = '请输入手机号';
					isValid = false;
				} else if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
					this.errors.phone = '请输入正确的手机号';
					isValid = false;
				}
				
				// 密码验证
				if (!this.form.password) {
					this.errors.password = '请设置密码';
					isValid = false;
				} else if (!/^[0-9a-zA-Z]{8,18}$/.test(this.form.password)) {
					this.errors.password = '密码需为8-18位数字、字母组合';
					isValid = false;
				}
				
				// 确认密码验证
				if (!this.form.confirmPwd) {
					this.errors.confirmPwd = '请再次输入密码';
					isValid = false;
				} else if (this.form.confirmPwd !== this.form.password) {
					this.errors.confirmPwd = '两次输入的密码不一致';
					isValid = false;
				}
				
				return isValid;
			},
			
			// 提交注册
			async toRegister() {
				// 检查是否同意协议
				if (!this.agreed) {
					uni.showToast({
						title: '请先阅读并同意用户协议',
						icon: 'none'
					});
					return;
				}
				
				// 表单验证
				if (!this.validateForm()) return;
				
				// 防止重复提交
				if (this.registering) return;
				
				try {
					this.registering = true;
					uni.showLoading({ title: '注册中...', mask: true });
					
					// 调用注册接口
					const res = await memberRegister({
						username: this.form.username,
						phone: this.form.phone,
						password: this.form.password
					});
					
					// 处理注册结果
					if (res.code === 200) {
						uni.hideLoading();
						uni.showToast({
							title: '注册成功',
							icon: 'success',
							duration: 1500
						});
						
						// 延迟跳转，让用户看到成功提示
						setTimeout(() => {
							// 保存用户名，方便登录页自动填充
							uni.setStorageSync('username', this.form.username);
							uni.navigateTo({
								url: '/pages/public/login?from=register'
							});
						}, 1500);
					} else {
						uni.hideLoading();
						// 后端返回的错误（如用户名已存在、手机号已注册）
						this.handleBackendError(res.data?.msg || res.message || '注册失败');
					}
				} catch (err) {
					uni.hideLoading();
					console.error('注册失败:', err);
					uni.showToast({
						title: '网络错误，请稍后重试',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.registering = false;
				}
			},
			
			// 处理后端返回的错误信息
			handleBackendError(msg) {
				// 根据后端返回的错误信息，显示到对应的字段
				if (msg.includes('用户名') || msg.includes('username')) {
					this.errors.username = msg;
				} else if (msg.includes('手机号') || msg.includes('phone') || msg.includes('手机')) {
					this.errors.phone = msg;
				} else if (msg.includes('密码') || msg.includes('password')) {
					this.errors.password = msg;
				} else {
					// 其他错误统一显示
					uni.showToast({
						title: msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		}
	};
</script>

<style lang="scss" scoped>
	.register-container {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		overflow: hidden;
	}

	// 背景装饰（与登录页相同）
	.bg-decoration {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		z-index: 0;
	}

	.circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		animation: float 20s infinite ease-in-out;
	}

	.circle-1 {
		width: 300px;
		height: 300px;
		top: -100px;
		right: -100px;
		animation-delay: 0s;
	}

	.circle-2 {
		width: 200px;
		height: 200px;
		bottom: -50px;
		left: -50px;
		animation-delay: 5s;
	}

	.circle-3 {
		width: 150px;
		height: 150px;
		top: 50%;
		left: 10%;
		animation-delay: 10s;
	}

	@keyframes float {
		0%, 100% {
			transform: translate(0, 0) rotate(0deg);
		}
		33% {
			transform: translate(30px, -30px) rotate(120deg);
		}
		66% {
			transform: translate(-20px, 20px) rotate(240deg);
		}
	}

	// 返回按钮
	.back-btn {
		position: absolute;
		top: calc(var(--status-bar-height) + 20rpx);
		left: 30rpx;
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		backdrop-filter: blur(10px);
		z-index: 100;
		
		.back-icon {
			font-size: 60rpx;
			color: #fff;
			line-height: 1;
			font-weight: 300;
		}
	}

	// 主要内容区域
	.content-wrapper {
		position: relative;
		z-index: 10;
		padding: 120rpx 60rpx 60rpx;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	// 头部区域
	.header-section {
		text-align: center;
		margin-bottom: 60rpx;
	}

	.logo-wrapper {
		margin-bottom: 40rpx;
	}

	.logo-text {
		font-size: 80rpx;
		font-weight: bold;
		color: #fff;
		letter-spacing: 4rpx;
		text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
	}

	.title {
		font-size: 56rpx;
		font-weight: 600;
		color: #fff;
		margin-bottom: 20rpx;
	}

	.subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	// 表单区域
	.form-section {
		flex: 1;
		background: #fff;
		border-radius: 40rpx 40rpx 0 0;
		padding: 60rpx 50rpx;
		margin-top: 60rpx;
		box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.1);
	}

	// 输入框样式（与登录页相同）
	.input-wrapper {
		position: relative;
		margin-bottom: 50rpx;
		padding-bottom: 20rpx;
		
		&.error {
			.input-line {
				background: #ff3b30;
			}
		}
	}

	.input-icon {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #999;
		
		.icon-text {
			font-size: 36rpx;
		}
	}

	.input-field {
		width: 100%;
		height: 80rpx;
		padding-left: 80rpx;
		padding-right: 20rpx;
		font-size: 32rpx;
		color: #333;
		background: transparent;
		border: none;
		outline: none;
	}

	.input-placeholder {
		color: #999;
	}

	.input-line {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2rpx;
		background: #e5e5e5;
		transition: all 0.3s ease;
		
		&.active {
			background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
			height: 3rpx;
		}
	}

	.error-message {
		font-size: 24rpx;
		color: #ff3b30;
		margin-top: -40rpx;
		margin-bottom: 20rpx;
		padding-left: 80rpx;
	}

	// 协议区域
	.agreement-section {
		margin-bottom: 60rpx;
	}

	.agreement-checkbox {
		display: flex;
		align-items: flex-start;
		
		.checkbox {
			width: 36rpx;
			height: 36rpx;
			border: 2rpx solid #ddd;
			border-radius: 6rpx;
			margin-right: 16rpx;
			margin-top: 4rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			transition: all 0.3s ease;
			
			&.checked {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border-color: #667eea;
				
				.check-icon {
					color: #fff;
					font-size: 24rpx;
					font-weight: bold;
				}
			}
		}
		
		.agreement-text {
			font-size: 26rpx;
			color: #666;
			line-height: 1.6;
			
			.link-text {
				color: #667eea;
			}
		}
	}

	// 注册按钮
	.register-btn {
		width: 100%;
		height: 96rpx;
		line-height: 96rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		font-size: 36rpx;
		font-weight: 600;
		border-radius: 48rpx;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
		transition: all 0.3s ease;
		
		&:active {
			transform: scale(0.98);
			box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
		}
		
		&.loading {
			opacity: 0.7;
		}
		
		&.disabled {
			opacity: 0.5;
			box-shadow: none;
		}
		
		&:disabled {
			opacity: 0.5;
		}
	}

	// 登录链接
	.login-link {
		text-align: center;
		margin-top: 40rpx;
		padding: 40rpx 0;
		
		.link-text {
			font-size: 28rpx;
			color: rgba(255, 255, 255, 0.8);
		}
		
		.link-btn {
			font-size: 28rpx;
			color: #fff;
			font-weight: 600;
			margin-left: 10rpx;
			text-decoration: underline;
		}
	}
</style>
