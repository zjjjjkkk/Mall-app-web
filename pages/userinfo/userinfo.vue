<template>
	<view class="page">
		<view class="card header-card">
			<view class="avatar-wrap">
				<image class="avatar" :src="form.icon || defaultAvatar"></image>
				<button class="avatar-btn" size="mini" :loading="uploading" @click="chooseAvatar">更换头像</button>
			</view>
			<view class="meta">
				<text class="name">{{ form.username || '未设置用户名' }}</text>
				<text class="desc">{{ form.phone || '未绑定电话' }}</text>
			</view>
		</view>

		<view class="card form-card">
			<view class="section-title">基本信息</view>
			<view class="form-item">
				<text class="label">用户名</text>
				<input class="input" v-model="form.username" placeholder="请输入用户名" />
			</view>
			<view class="form-item">
				<text class="label">性别</text>
				<view class="radio-group">
					<label class="radio-item">
						<radio :checked="form.gender === 1" @click="form.gender = 1" /> 男
					</label>
					<label class="radio-item">
						<radio :checked="form.gender === 2" @click="form.gender = 2" /> 女
					</label>
					<label class="radio-item">
						<radio :checked="form.gender === 0" @click="form.gender = 0" /> 保密
					</label>
				</view>
			</view>
			<view class="form-item">
				<text class="label">联系电话</text>
				<input class="input" v-model="form.phone" type="number" placeholder="请输入手机号" />
			</view>
			<view class="form-item">
				<text class="label">个人简介</text>
				<textarea class="textarea" v-model="form.personalizedSignature" placeholder="一句话介绍自己" maxlength="100"></textarea>
			</view>
		</view>

		<button class="save-btn" :loading="saving" @click="handleSave">保存</button>
	</view>
</template>

<script>
import { memberInfo, updateProfile, uploadAvatar } from '@/api/member.js'
import { mapState, mapMutations } from 'vuex'

export default {
	data() {
		return {
			form: {
				username: '',
				gender: 0,
				phone: '',
				personalizedSignature: '',
				icon: ''
			},
			saving: false,
			uploading: false,
			defaultAvatar: '/static/missing-face.png'
		}
	},
	computed: {
		...mapState(['userInfo'])
	},
	onShow() {
		this.loadInfo()
	},
	methods: {
		...mapMutations(['login']),
		async loadInfo() {
			try {
				const res = await memberInfo()
				if (res && res.code === 200 && res.data) {
					const info = res.data
					this.form.username = info.username || ''
					this.form.gender = info.gender != null ? info.gender : 0
					this.form.phone = info.phone || ''
					this.form.personalizedSignature = info.personalizedSignature || ''
					this.form.icon = info.icon || ''
					this.login(info)
				}
			} catch (e) {
				uni.showToast({ title: '加载资料失败', icon: 'none' })
			}
		},
		validate() {
			if (!this.form.username.trim()) {
				uni.showToast({ title: '请输入用户名', icon: 'none' })
				return false
			}
			if (this.form.phone && !/^1[3-9]\d{9}$/.test(this.form.phone)) {
				uni.showToast({ title: '手机号格式不正确', icon: 'none' })
				return false
			}
			return true
		},
		chooseAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					const path = res.tempFilePaths && res.tempFilePaths[0]
					if (!path) return
					this.uploading = true
					uni.showLoading({ title: '上传中...' })
					try {
						const result = await uploadAvatar(path)
						if (result && result.code === 200) {
							const url = result.data
							this.form.icon = url
							await updateProfile({ icon: url })
							this.login({ ...this.userInfo, icon: url })
							uni.showToast({ title: '头像已更新', icon: 'success' })
						} else {
							uni.showToast({ title: (result && result.message) || '上传失败', icon: 'none' })
						}
					} catch (e) {
						uni.showToast({ title: '上传失败', icon: 'none' })
					} finally {
						uni.hideLoading()
						this.uploading = false
					}
				},
				fail: () => {
					uni.showToast({ title: '选择图片失败', icon: 'none' })
				}
			})
		},
		async handleSave() {
			if (!this.validate()) return
			this.saving = true
			try {
				const res = await updateProfile(this.form)
				if (res && res.code === 200) {
					uni.showToast({ title: '保存成功', icon: 'success' })
					await this.loadInfo()
				} else {
					uni.showToast({ title: (res && res.message) || '保存失败', icon: 'none' })
				}
			} catch (e) {
				uni.showToast({ title: '保存失败', icon: 'none' })
			} finally {
				this.saving = false
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	padding: 24rpx;
	background: #f5f6f8;
	box-sizing: border-box;
}
.card {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04);
	margin-bottom: 20rpx;
}
.header-card {
	display: flex;
	align-items: center;
	.avatar-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 24rpx;
		.avatar {
			width: 140rpx;
			height: 140rpx;
			border-radius: 70rpx;
			border: 2rpx solid #e5e6eb;
			background: #f2f3f5;
		}
		.avatar-btn {
			margin-top: 12rpx;
			background: linear-gradient(135deg, #5a8dee, #3f6fe0);
			color: #fff;
			border-radius: 24rpx;
			padding: 0 24rpx;
		}
	}
	.meta {
		flex: 1;
		display: flex;
		flex-direction: column;
		.name {
			font-size: 34rpx;
			font-weight: 700;
			color: #333;
		}
		.desc {
			margin-top: 8rpx;
			font-size: 26rpx;
			color: #888;
		}
	}
}
.form-card {
	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}
	.form-item {
		margin-bottom: 20rpx;
		.label {
			display: block;
			font-size: 28rpx;
			color: #555;
			margin-bottom: 10rpx;
		}
		.input {
			width: 100%;
			height: 84rpx;
			padding: 0 20rpx;
			border: 1rpx solid #e5e6eb;
			border-radius: 12rpx;
			background: #f7f8fa;
			box-sizing: border-box;
		}
		.textarea {
			width: 100%;
			min-height: 180rpx;
			padding: 16rpx 20rpx;
			border: 1rpx solid #e5e6eb;
			border-radius: 12rpx;
			background: #f7f8fa;
			box-sizing: border-box;
		}
	}
}
.radio-group {
	display: flex;
	align-items: center;
	.radio-item {
		display: flex;
		align-items: center;
		margin-right: 32rpx;
		font-size: 28rpx;
		color: #444;
	}
	radio {
		transform: scale(0.8);
		margin-right: 8rpx;
	}
}
.save-btn {
	margin-top: 12rpx;
	background: linear-gradient(135deg, #5a8dee, #3f6fe0);
	color: #fff;
	border-radius: 44rpx;
	height: 88rpx;
	line-height: 88rpx;
	font-size: 32rpx;
}
</style>

