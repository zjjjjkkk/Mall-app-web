<template>
	<view class="order-detail-page">
		<!-- 订单状态头部 -->
		<view class="status-section">
			<image :src="orderStatus.image" class="icon" />
			<text class="label-text">{{ orderStatus.text }}</text>
		</view>

		<!-- 收货地址 -->
		<view class="address-section">
			<view class="order-content">
				<text class="yticon icon-shouhuodizhi"></text>
				<view class="cen">
					<view class="top">
						<text class="name">{{ order.receiverName || '未知收件人' }}</text>
						<text class="mobile">{{ order.receiverPhone || '未知手机号' }}</text>
					</view>
					<text class="address">
						{{ order.receiverProvince || '' }} {{ order.receiverCity || '' }} {{ order.receiverRegion || '' }}
						{{ order.receiverDetailAddress || '未知详细地址' }}
					</text>
				</view>
			</view>
			<!-- 本地图片路径 -->
			<image class="a-bg" src="/static/tab-cart.png" />
		</view>

		<!-- 订单商品列表 -->
		<view class="order-items" v-if="(order.orderItems && order.orderItems.length > 0) || (order.orderItemList && order.orderItemList.length > 0)">
			<view class="items-title">订单商品</view>
			<view class="item-card" v-for="(item, index) in (order.orderItems || order.orderItemList || [])" :key="index">
				<image :src="item.productPic" mode="aspectFill" class="item-image"></image>
				<view class="item-info">
					<text class="item-name">{{ item.productName }}</text>
					<text class="item-attr" v-if="item.productAttr">{{ item.productAttr }}</text>
					<view class="item-bottom">
						<text class="item-price">¥{{ item.productPrice }}</text>
						<text class="item-quantity">x{{ item.productQuantity }}</text>
					</view>
				</view>
				<button 
					class="comment-btn" 
					v-if="order.status === 3" 
					@click="goToComment(item)"
				>
					评价
				</button>
			</view>
		</view>

		<!-- 订单核心信息 -->
		<view class="order-info">
			<view class="order-sn">订单编号：{{ order.orderSn || '未知' }}</view>
			<view class="order-amount">订单金额：¥{{ order.totalAmount || 0 }}</view>
			<!-- 修复按钮显示逻辑：兼容hasRefund字段不存在的情况 -->
			<button 
				class="refund-btn" 
				v-if="order.status !== 4 && !order.hasRefund && (order.status === 1 || order.status === 2 || order.status === 3)" 
				@click="openRefundApply"
			>
				申请退款
			</button>
		</view>

		<!-- 退款申请弹窗 -->
		<uni-popup ref="refundPopup" type="center" mask-click="false">
			<view class="refund-popup">
				<view class="popup-title">申请退款</view>
				<view class="popup-form">
					<view class="form-item">
						<text class="label">退款金额</text>
						<input 
							type="number" 
							v-model="refundAmount" 
							:placeholder="`最多¥${order.totalAmount || 0}`"
							maxlength="10"
						/>
					</view>
					<view class="form-item">
						<text class="label">退款原因</text>
						<picker @change="selectReason" :value="reasonIndex" :range="refundReasons">
							<view class="picker-text">{{ refundReasons[reasonIndex] }}</view>
						</picker>
					</view>
					<view class="form-item">
						<text class="label">备注说明</text>
						<textarea v-model="refundRemark" placeholder="选填，补充退款原因"></textarea>
					</view>
				</view>
				<view class="popup-btn-group">
					<button class="cancel-btn" @click="closeRefundApply">取消</button>
					<button class="confirm-btn" @click="submitRefundApply" :disabled="submitting">
						{{ submitting ? '提交中...' : '确认提交' }}
					</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { fetchOrderDetail, createOrderReturnApply } from '@/api/order.js'

export default {
	data() {
		return {
			order: {}, // 订单详情
			refundAmount: '', // 退款金额
			reasonIndex: 0, // 退款原因索引
			refundReasons: ['商品质量问题', '不想要了', '发货太慢', '商品错发/漏发', '其他'],
			refundRemark: '', // 退款备注
			submitting: false, // 提交状态
			orderStatus: { // 默认订单状态
				image: '/static/tab-cart.png',
				text: '待付款'
			}
		}
	},
	onLoad(options) {
		if (options.orderId) {
			this.getOrderDetail(options.orderId)
		}
	},
	methods: {
		// 获取订单详情
		async getOrderDetail(orderId) {
			try {
				const res = await fetchOrderDetail(orderId)
				if (res.code === 200) {
					this.order = res.data
					// 补全缺失的hasRefund字段
					if (this.order.hasRefund === undefined) {
						this.order.hasRefund = false
					}
					// 统一订单商品列表字段名
					if (this.order.orderItemList && !this.order.orderItems) {
						this.order.orderItems = this.order.orderItemList
					}
					// 设置订单状态
					this.setOrderStatus(this.order.status)
				} else {
					uni.showToast({ title: res.msg || '获取订单失败', icon: 'none' })
				}
			} catch (err) {
				uni.showToast({ title: '网络异常，显示模拟订单数据', icon: 'none' })
				// 模拟订单数据（兜底）
				this.order = {
					id: orderId,
					orderSn: '20251205001',
					totalAmount: 99.99,
					status: 2, // 2-待收货（可退款状态）
					hasRefund: false,
					receiverName: '张三',
					receiverPhone: '13800138000',
					receiverProvince: '广东省',
					receiverCity: '深圳市',
					receiverRegion: '南山区',
					receiverDetailAddress: '科技园路1号'
				}
				this.setOrderStatus(2)
			}
		},

		// 设置订单状态文本和图标
		setOrderStatus(status) {
			const statusMap = {
				0: { text: '待付款', image: '/static/tab-cart.png' },
				1: { text: '待发货', image: '/static/tab-cart.png' },
				2: { text: '待收货', image: '/static/tab-cart.png' },
				3: { text: '已完成', image: '/static/tab-cart.png' },
				4: { text: '已取消', image: '/static/tab-cart.png' }
			}
			this.orderStatus = statusMap[status] || statusMap[0]
			// 确保订单商品列表字段统一
			if (this.order.orderItemList && !this.order.orderItems) {
				this.order.orderItems = this.order.orderItemList
			}
		},

		// 打开退款申请弹窗
		openRefundApply() {
			this.refundAmount = ''
			this.reasonIndex = 0
			this.refundRemark = ''
			this.$refs.refundPopup.open()
		},

		// 关闭退款申请弹窗
		closeRefundApply() {
			this.$refs.refundPopup.close()
		},

		// 选择退款原因
		selectReason(e) {
			this.reasonIndex = e.detail.value
		},

		// 提交退款申请
		async submitRefundApply() {
			const totalAmount = Number(this.order.totalAmount || 0)
			const refundAmount = Number(this.refundAmount)

			// 校验
			if (!this.refundAmount || refundAmount <= 0) {
				uni.showToast({ title: '请输入有效退款金额', icon: 'none' })
				return
			}
			if (refundAmount > totalAmount) {
				uni.showToast({ title: '退款金额不能超过订单金额', icon: 'none' })
				return
			}

			this.submitting = true
			try {
				// 调用退款申请接口（模拟）
				const res = await createOrderReturnApply({
					orderId: this.order.id,
					returnAmount: this.refundAmount,
					returnReason: this.refundReasons[this.reasonIndex],
					remark: this.refundRemark
				})
				if (res.code === 200) {
					uni.showToast({ title: res.msg })
					this.closeRefundApply()
					// 标记订单为已申请退款
					this.order.hasRefund = true
					// 跳转退款列表页
					setTimeout(() => {
						uni.navigateTo({ url: '/pages/user/refundList' })
					}, 1500)
				} else {
					uni.showToast({ title: res.msg || '提交失败', icon: 'none' })
				}
			} catch (err) {
				uni.showToast({ title: '网络异常，提交失败', icon: 'none' })
				console.error('退款申请失败：', err)
			} finally {
				this.submitting = false
			}
		},
		// 跳转到评价页面
		goToComment(item) {
			const params = {
				productId: item.productId,
				productName: item.productName,
				productPic: item.productPic,
				productAttribute: item.productAttr || ''
			}
			const query = Object.keys(params).map(key => {
				return `${key}=${encodeURIComponent(params[key])}`
			}).join('&')
			uni.navigateTo({
				url: `/pages/order/comment?${query}`
			})
		}
	}
}
</script>

<style scoped>
.order-detail-page {
	padding: 10upx 20upx;
	background-color: #f5f5f5;
	min-height: 100vh;
}
.status-section {
	text-align: center;
	padding: 20upx 0;
	background: #fff;
	margin-bottom: 10upx;
	border-radius: 8upx;
}
.status-section .icon {
	width: 80upx;
	height: 80upx;
	margin-bottom: 10upx;
}
.status-section .label-text {
	font-size: 28upx;
	color: #333;
}
.address-section {
	background: #fff;
	padding: 20upx;
	border-radius: 8upx;
	margin-bottom: 10upx;
	position: relative;
}
.a-bg {
	position: absolute;
	right: 20upx;
	top: 50%;
	transform: translateY(-50%);
	width: 60upx;
	height: 60upx;
	opacity: 0.1;
}
.order-content {
	position: relative;
	z-index: 1;
}
.order-content .yticon {
	font-size: 36upx;
	color: #fa436a;
	margin-right: 10upx;
}
.cen .top {
	display: flex;
	align-items: center;
	margin-bottom: 10upx;
}
.cen .name {
	font-size: 28upx;
	color: #333;
	margin-right: 20upx;
}
.cen .mobile {
	font-size: 26upx;
	color: #666;
}
.cen .address {
	font-size: 26upx;
	color: #666;
	line-height: 1.4;
}
.order-info {
	background: #fff;
	padding: 20upx;
	border-radius: 8upx;
	margin-bottom: 10upx;
}
.order-sn, .order-amount {
	font-size: 28upx;
	color: #333;
	margin-bottom: 10upx;
}
.refund-btn {
	background: #f5222d;
	color: #fff;
	border-radius: 8upx;
	padding: 12upx 24upx;
	font-size: 28upx;
	margin-top: 20upx;
	width: 100%;
}
.order-items {
	background: #fff;
	padding: 20upx;
	border-radius: 8upx;
	margin-bottom: 10upx;
}
.items-title {
	font-size: 30upx;
	color: #333;
	font-weight: bold;
	margin-bottom: 20upx;
}
.item-card {
	display: flex;
	align-items: center;
	padding: 20upx 0;
	border-bottom: 1px solid #f5f5f5;
	position: relative;
}
.item-card:last-child {
	border-bottom: none;
}
.item-image {
	width: 120upx;
	height: 120upx;
	border-radius: 8upx;
	margin-right: 20upx;
}
.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}
.item-name {
	font-size: 28upx;
	color: #333;
	margin-bottom: 10upx;
}
.item-attr {
	font-size: 24upx;
	color: #999;
	margin-bottom: 10upx;
}
.item-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.item-price {
	font-size: 28upx;
	color: #fa436a;
	font-weight: bold;
}
.item-quantity {
	font-size: 24upx;
	color: #999;
}
.item-actions {
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	gap: 10upx;
}

.action-btn {
	padding: 10upx 20upx;
	border-radius: 6upx;
	font-size: 24upx;
	border: none;
}

.comment-btn {
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border-radius: 8upx;
	padding: 12upx 24upx;
	font-size: 26upx;
}
.refund-popup {
	width: 80%;
	background: #fff;
	border-radius: 16upx;
	padding: 30upx;
}
.popup-title {
	font-size: 32upx;
	font-weight: 500;
	text-align: center;
	margin-bottom: 30upx;
}
.form-item {
	margin-bottom: 20upx;
}
.label {
	font-size: 28upx;
	color: #333;
	margin-bottom: 10upx;
	display: block;
}
input, textarea {
	border: 1upx solid #e5e5e5;
	border-radius: 8upx;
	padding: 12upx;
	font-size: 28upx;
	width: 100%;
}
.picker-text {
	border: 1upx solid #e5e5e5;
	border-radius: 8upx;
	padding: 12upx;
	font-size: 28upx;
	width: 100%;
}
.popup-btn-group {
	display: flex;
	justify-content: space-between;
	margin-top: 30upx;
}
.cancel-btn {
	flex: 1;
	margin-right: 10upx;
	background: #f5f5f5;
	color: #333;
}
.confirm-btn {
	flex: 1;
	margin-left: 10upx;
	background: #f5222d;
	color: #fff;
}
</style>
