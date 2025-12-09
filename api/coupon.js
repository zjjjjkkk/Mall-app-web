import request from '@/utils/requestUtil'

export function fetchProductCouponList(productId) {
	return request({
		method: 'GET',
		url: `/member/coupon/listByProduct/${productId}`,
	})
}

export function addMemberCoupon(couponId) {
	return request({
		method: 'POST',
		url: `/member/coupon/add/${couponId}`,
	})
}

export function fetchMemberCouponList(useStatus) {
	return request({
		method: 'GET',
		url: '/member/coupon/list',
		params:{useStatus:useStatus}
	})
}

/**
 * 使用积分兑换优惠券
 */
export function exchangeCouponWithIntegration(couponId) {
	return request({
		method: 'POST',
		url: `/member/coupon/exchange/${couponId}`
	})
}