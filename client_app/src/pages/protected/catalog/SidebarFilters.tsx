import CustomSelect from "@components/ui/form/CustomSelect";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { Button, Label,Sidebar } from "flowbite-react";
import { useCollections } from "@hooks/data-fetching/collection";
import { useSearchTags } from "@hooks/data-fetching/search-tag";

type SidebarFiltersType = {
    filterParams: any;
    setFilterParams:  (newValues: Record<string, any>) => void;
    isOpen: boolean
    close: ()=>void
}
const SidebarFilters = ({ filterParams, setFilterParams, isOpen, close }: SidebarFiltersType) => {
  const { data: collections } = useCollections();
  const { data: tags } = useSearchTags({});
  const sidebarClass = isOpen ? "flex" : "hidden lg:flex";
  return (
    <Sidebar className={"bg-white dark:bg-gray-800 px-3 p-2 w-full lg:w-64 " + sidebarClass}>
    <h4 className="text-xl text-gray-900 dark:text-white py-1 mt-11">Filters</h4>
      <ul className="space-y-4 mt-1">
        <li>
          <Label>Collection</Label>
          <CustomSelect
            onChange={(values) =>
              setFilterParams({ collections: values.map((c) => c.id), page: 1 })
            }
            options={collections}
            isMulti
            value={collections?.filter((c) =>
              filterParams.collections.includes(c.id)
            )}
            getOptionLabel={(opt) => opt.name}
            getOptionValue={(opt) => opt.id?.toString() ?? ""}
            placeholder="Select Collection"
          />
        </li>

        <li>
          <Label>Subject Tags</Label>
          <CustomSelect
            onChange={(values) =>
              setFilterParams({ tags: values.map((v) => v.value), page: 1 })
            }
            options={tags?.map((t) => ({ label: t, value: t }))}
            isMulti
            placeholder="Select Subject"
          />
        </li>

        <li>
          <Label>Year Published From</Label>
          <CustomDatePicker
            onChange={(date) =>{
              if(!date) return;
              setFilterParams({ fromYearPublished: date.getFullYear(), page: 1 })
            }}
            selected={new Date(filterParams.fromYearPublished, 0, 1)}
            showYearPicker
            dateFormat="yyyy"
          />
        </li>

        <li>
          <Label>Year Published To</Label>
          <CustomDatePicker
            onChange={(date) =>{
              if(!date) return;
              setFilterParams({ toYearPublished: date.getFullYear(), page: 1 })
            }}
            selected={new Date(filterParams.toYearPublished, 0, 1)}
            showYearPicker
            dateFormat="yyyy"
          />
        </li>

        <li className="flex gap-1 items-center">            
          <Button color="blue" size="sm" onClick={() => setFilterParams({
            page: 1,
            keyword: "",
            collections: [],
            fromYearPublished: 1980,
            toYearPublished: new Date().getFullYear()
          })}>
            Reset Filters
          </Button>
          <Button color="light" className="lg:hidden"  size="sm" onClick={close} >
            Close
          </Button>
        </li>
      </ul>
    </Sidebar>
  );
};

export default SidebarFilters;
