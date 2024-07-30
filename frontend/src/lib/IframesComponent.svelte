<script lang="ts">
    export let iframe_source_template;
    export let is_moved_to_top;

    export let is_on_side;

    export let selected_preset;
    export let current_presets_hue_as_number;
    export let iframe_with_replacements;
</script>
<div class={`w-full flex flex-col items-center ${$$restProps.class}`} style={`${$$restProps.style}` ?? ""}>
    <div class="w-full flex">
        <div class="w-1/12">
            {#if !is_on_side}
                <button
                    style="width: 2.574rem;"
                    class="btn btn-larges variant-filled"
                    type="button"
                    on:click={() => {
                        is_moved_to_top = !is_moved_to_top;
                    }}
                >
                    <abbr title={`move ${is_moved_to_top ? "down" : "up"}`}>
                        {#if is_moved_to_top}
                            <i class="fa-solid fa-chevron-down" />
                        {:else}
                            <i class="fa-solid fa-chevron-up" />
                        {/if}
                    </abbr>
                </button>
            {/if}
        </div>
        <div class="card p-2 w-10/12">
            {#each selected_preset?.iframes ?? [] as iframe, index}
                <button
                    style={`color: hsl(${current_presets_hue_as_number + index*45} ${
                        iframe_source_template == iframe[1]
                            ? '100% 20%); background-color: hsl(' + (current_presets_hue_as_number + index*45) + ' 100% 87%);'
                            : '70% 50%);'
                    }`}
                    class={`btn ${
                        iframe_source_template == iframe[1] ? 'variant-filled' : 'variant-ghost'
                    } m-0.5`}
                    on:click={()=>{iframe_source_template = iframe[1]}}
                >
                    {iframe[0]}
                </button>
            {/each}
        </div>
    </div>
    <div style="word-wrap: break-word; line-break:anywhere; max-width: 96%;">{iframe_with_replacements}</div>
    <iframe title="iframe" src={iframe_with_replacements} style="width: 96%; height: 100vh;" />
</div>