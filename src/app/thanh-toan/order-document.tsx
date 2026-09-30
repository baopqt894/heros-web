import Image from "next/image";
import { statusLabels } from "@/lib/commerce";
import {
  formatDate,
  formatMoney,
  receiptNumber,
  type OrderDetails,
} from "@/lib/order-view";

export default function OrderDocument({ order }: { order: OrderDetails }) {
  return (
    <article className="order-document" aria-label="Phiếu xác nhận đơn hàng">
      <header className="document-heading">
        <div className="document-brand">
          <Image
            src="/images/heros-logo.png"
            alt="Heros"
            width={116}
            height={55}
          />
          <span>Vì bạn xứng đáng được quan tâm</span>
        </div>
        <div>
          <p className="document-label">Phiếu xác nhận đơn hàng</p>
          <strong>{receiptNumber(order.orderCode)}</strong>
          <p>Ngày đặt: {formatDate(order.createdAt)}</p>
        </div>
      </header>
      <section className="document-recipient">
        <div>
          <p className="document-label">Gửi đến</p>
          <h2>{order.customer.name}</h2>
          <p>
            {order.customer.phone}
            <br />
            {order.customer.email}
          </p>
        </div>
        <div>
          <p className="document-label">Địa chỉ nhận hàng</p>
          <p>{order.customer.address}</p>
        </div>
      </section>
      <div className="document-product">
        <div className="document-product-image">
          <Image
            src="/images/heros-product.png"
            alt="Thiết bị Heros hồng phấn và dây đeo"
            width={96}
            height={110}
          />
        </div>
        <div>
          <h2>Heros · Hồng phấn</h2>
          <p>Thiết bị SOS & dây đeo</p>
          <span>
            {formatMoney(order.amount / order.quantity)} × {order.quantity}
          </span>
        </div>
        <strong>{formatMoney(order.amount)}</strong>
      </div>
      <dl className="document-totals">
        <div>
          <dt>Tạm tính</dt>
          <dd>{formatMoney(order.amount)}</dd>
        </div>
        <div>
          <dt>Phí giao hàng</dt>
          <dd>Miễn phí</dd>
        </div>
        <div className="document-total">
          <dt>Tổng cộng</dt>
          <dd>{formatMoney(order.amount)}</dd>
        </div>
      </dl>
      <div className="document-payment">
        <div>
          <p className="document-label">Phương thức</p>
          <strong>
            {order.method === "payos"
              ? "Chuyển khoản qua payOS"
              : "Thanh toán khi nhận hàng"}
          </strong>
        </div>
        <div>
          <p className="document-label">Trạng thái thanh toán</p>
          <strong className={order.status === "PAID" ? "payment-verified" : ""}>
            {statusLabels[order.status]}
          </strong>
          {order.paidAt && <p>Xác nhận ngày {formatDate(order.paidAt)}</p>}
        </div>
      </div>
      <footer className="document-footnote">
        Cảm ơn bạn đã lựa chọn Heros.
        <span>Phiếu xác nhận mua hàng, không phải hóa đơn VAT.</span>
      </footer>
    </article>
  );
}
