import request from '@/utils/requestUtil'

// 原有订单接口（保留不变）
export function generateConfirmOrder(data) {
	return request({
		method: 'POST',
		url: '/order/generateConfirmOrder',
		data: data
	})
}

export function generateOrder(data) {
	return request({
		method: 'POST',
		url: '/order/generateOrder',
		data: data
	})
}

export function fetchOrderList(params) {
	return request({
		method: 'GET',
		url: '/order/list',
		params: params
	})
}

export function payOrderSuccess(data) {
	return request({
		method: 'POST',
		url: '/order/paySuccess',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function fetchOrderDetail(orderId) {
	return request({
		method: 'GET',
		url: `/order/detail/${orderId}`
	})
}

export function cancelUserOrder(data) {
	return request({
		method: 'POST',
		url: '/order/cancelUserOrder',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function confirmReceiveOrder(data) {
	return request({
		method: 'POST',
		url: '/order/confirmReceiveOrder',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function deleteUserOrder(data) {
	return request({
		method: 'POST',
		url: '/order/deleteOrder',
		header: {
			'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		},
		data: data
	})
}

export function fetchAliapyStatus(params) {
	return request({
		method: 'GET',
		url: '/alipay/query',
		params: params
	})
}

// 退款接口 - 对接后端真实接口
// 提交退款申请
export function createOrderReturnApply(data) {
	return request({
		method: 'POST',
		url: '/order/refundOrder/apply',
		data: data
	})
}

// 查询退款列表
// 注意：后端返回的是 List<OmsRefundOrder>，不是分页对象
// params: { refundStatus?: number } - refundStatus 为可选的退款状态筛选
export function getOrderReturnApplyList(params) {
	return request({
		method: 'GET',
		url: '/order/refundOrder/list',
		params: params || {}
	}).then(res => {
		// 适配后端返回格式：后端直接返回 List，前端期望 { list, total } 格式
		if (res.code === 200 && Array.isArray(res.data)) {
			return {
				...res,
				data: {
					list: res.data,
					total: res.data.length
				}
			}
		}
		return res
	})
}

// 查询退款详情
export function getOrderReturnApplyDetail(id) {
	return request({
		method: 'GET',
		url: `/order/refundOrder/${id}`
	})
}

// 取消退款申请
// 注意：后端Controller中暂未提供此接口，如需使用请在后端添加
// 临时保留模拟数据，待后端实现后替换为真实请求
export function cancelOrderReturnApply(id) {
	// TODO: 待后端添加取消退款接口后，替换为真实请求
	// return request({
	// 	method: 'POST',
	// 	url: `/order/refundOrder/cancel/${id}`
	// })
	
	// 临时返回模拟数据
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				code: 200,
				msg: '退款申请取消成功（模拟）'
			})
		}, 500)
	})
}
