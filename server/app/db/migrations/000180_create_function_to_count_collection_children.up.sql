create or replace function count_children_of_collection(collection_id int)
returns INT
language plpgsql
as
$$
declare 
	children_count INT;
begin
	 EXECUTE 'WITH RECURSIVE collection_tree AS (
                SELECT * FROM catalog.section WHERE id = $1 AND deleted_at IS NULL
                UNION ALL
                SELECT section.* FROM catalog.section INNER JOIN collection_tree ON 
                section.main_collection_id = collection_tree.id AND section.deleted_at IS NULL
            )
            SELECT COALESCE(COUNT(1), 0) FROM collection_tree WHERE id != $1'
    INTO children_count
    USING collection_id;
    RETURN children_count;
end;
$$;
