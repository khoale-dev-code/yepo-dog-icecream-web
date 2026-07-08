import { Edit3, LayoutDashboard, Trash2, X } from "lucide-react";
import { RESERVATION_STATUS } from "../config/adminConfig";
import {
  Badge,
  CardActions,
  EmptyText,
  FilePicker,
  FormField,
  IconButton,
  Panel,
  SearchBox,
  SubmitButton,
} from "../components/ui/AdminPrimitives";
import {
  formatMoney,
  getGenericMeta,
  getId,
  getReservationLabel,
  getThumb,
} from "../utils/adminUtils";

export function ResourceView({
  resource,
  config,
  form,
  files,
  items,
  query,
  editingId,
  saving,
  setQuery,
  setFiles,
  updateForm,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
  onReservationStatus,
}) {
  const Icon = config.icon;

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
      <Panel title={editingId ? "Cập nhật dữ liệu" : config.formTitle} icon={Icon}>
        <form onSubmit={onSubmit} className="space-y-4">
          {config.fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={form[field.name]}
              onChange={(value) => updateForm(resource, field.name, value)}
            />
          ))}

          {config.supportMedia && <FilePicker files={files} setFiles={setFiles} />}

          <div className="flex gap-2">
            <SubmitButton
              saving={saving}
              label={editingId ? "Cập nhật" : "Thêm mới"}
            />

            {editingId && (
              <button
                type="button"
                onClick={onCancel}
                className="mt-5 grid h-[52px] w-14 shrink-0 place-items-center rounded-2xl bg-[#f7efe3] text-[#8c672f]"
                aria-label="Hủy sửa"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title={config.title} icon={LayoutDashboard}>
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder={`Tìm trong ${config.title.toLowerCase()}...`}
        />

        <div className="mt-4">
          {!items.length ? (
            <EmptyText text={config.emptyText} />
          ) : resource === "products" ? (
            <ProductGrid items={items} onEdit={onEdit} onDelete={onDelete} />
          ) : resource === "reservations" ? (
            <ReservationList
              items={items}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatus={onReservationStatus}
            />
          ) : (
            <GenericList
              items={items}
              resource={resource}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      </Panel>
    </div>
  );
}

function ProductGrid({ items, onEdit, onDelete }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <ProductCard
          key={getId(item)}
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(getId(item))}
        />
      ))}
    </div>
  );
}

function ProductCard({ item, onEdit, onDelete }) {
  const thumb = getThumb(item);

  return (
    <article className="overflow-hidden rounded-3xl border border-[#d8b77e] bg-[#FFFAFA] shadow-sm">
      <div className="aspect-square bg-white">
        {thumb ? (
          <img src={thumb} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-[#b98c49]">
            Không có ảnh
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <p className="line-clamp-2 text-base font-brand">{item.name}</p>

        <p className="mt-1 text-xs font-brand uppercase tracking-[0.08em] text-[#8c672f]">
          {item.category}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-lg font-brand">{formatMoney(item.price)}</p>

          {Number(item.oldPrice || 0) > Number(item.price || 0) && (
            <p className="text-sm font-medium text-neutral-400 line-through">
              {formatMoney(item.oldPrice)}
            </p>
          )}
        </div>

        <CardActions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  );
}

function GenericList({ items, resource, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <GenericCard
          key={getId(item)}
          item={item}
          resource={resource}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(getId(item))}
        />
      ))}
    </div>
  );
}

function GenericCard({ item, resource, onEdit, onDelete }) {
  const thumb = getThumb(item);
  const title = item.name || item.title || item.customerName || "Không tên";

  return (
    <article className="rounded-3xl border border-[#d8b77e] bg-[#FFFAFA] p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {thumb && (
          <div className="h-24 w-full overflow-hidden rounded-2xl bg-white sm:w-28">
            <img src={thumb} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-lg font-brand">{title}</p>

          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-[#6f5a3e]">
            {getGenericMeta(item, resource)}
          </p>

          <CardActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </article>
  );
}

function ReservationList({ items, onEdit, onDelete, onStatus }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ReservationCard
          key={getId(item)}
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(getId(item))}
          onStatus={(status) => onStatus(item, status)}
        />
      ))}
    </div>
  );
}

function ReservationCard({ item, onEdit, onDelete, onStatus }) {
  return (
    <article className="rounded-3xl border border-[#d8b77e] bg-[#FFFAFA] p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-brand">{item.customerName}</p>

          <p className="mt-1 text-sm font-medium text-[#6f5a3e]">
            {item.phone} · {item.date} {item.time} · {item.guestCount} khách
          </p>

          {item.note && (
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6f5a3e]">
              {item.note}
            </p>
          )}
        </div>

        <Badge
          text={getReservationLabel(item.status)}
          muted={item.status === "cancelled"}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {RESERVATION_STATUS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatus(option.value)}
            className="rounded-xl bg-[#f7efe3] px-3 py-2 text-xs font-brand text-[#8c672f] transition hover:bg-[#FFFAFA]"
          >
            {option.label}
          </button>
        ))}

        <IconButton icon={Edit3} label="Sửa" onClick={onEdit} />
        <IconButton icon={Trash2} label="Xóa" onClick={onDelete} danger />
      </div>
    </article>
  );
}



